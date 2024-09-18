import {
  Backdrop,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  Theme,
  Typography,
  useMediaQuery
} from '@mui/material'
import { BehaviorSubject, Subject, combineLatestWith, map, share } from 'rxjs'
import { base64URLEncode, formatSize } from '../utils'
import { useEffect, useMemo, useState, useTransition } from 'react'

import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { DirectoryEntry } from '../types'
import DownloadIcon from '@mui/icons-material/Download'
import FolderIcon from '@mui/icons-material/Folder'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import VideoFileIcon from '@mui/icons-material/VideoFile'
import { ffetch } from '../lib/httpClient'
import { matchW } from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/function'
import { serverURL } from '../atoms/settings'
import { useI18n } from '../hooks/useI18n'
import { useNavigate } from 'react-router-dom'
import { useObservable } from '../hooks/observable'
import { useRecoilValue } from 'recoil'
import { useToast } from '../hooks/toast'
import { activeDownloadsState } from "../atoms/downloads"

export default function Downloaded() {
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [showMenu, setShowMenu] = useState(false)
  const [currentFile, setCurrentFile] = useState<DirectoryEntry>()

  const serverAddr = useRecoilValue(serverURL)
  const downloads = useRecoilValue(activeDownloadsState)
  const navigate = useNavigate()

  const { i18n } = useI18n()
  const { pushMessage } = useToast()

  const [openDialog, setOpenDialog] = useState(false)

  const files$ = useMemo(() => new Subject<DirectoryEntry[]>(), [])
  const selected$ = useMemo(() => new BehaviorSubject<string[]>([]), [])

  const [isPending, startTransition] = useTransition()

  const fetcher = () => pipe(
    ffetch<DirectoryEntry[]>(
      `${serverAddr}/archive/downloaded`,
      {
        method: 'POST',
        body: JSON.stringify({
          subdir: '',
        })
      }
    ),
    matchW(
      (e) => {
        pushMessage(e, 'error')
        navigate('/login')
      },
      (d) => files$.next(d ?? []),
    )
  )()

  const fetcherSubfolder = (sub: string) => {
    const folders = sub.startsWith('/')
      ? sub.substring(1).split('/')
      : sub.split('/')

    const relpath = folders.length >= 2
      ? folders.slice(-(folders.length - 1)).join('/')
      : folders.pop()

    const _upperLevel = folders.slice(1, -1)
    const upperLevel = _upperLevel.length === 2
      ? ['.', ..._upperLevel].join('/')
      : _upperLevel.join('/')

    const task = ffetch<DirectoryEntry[]>(`${serverAddr}/archive/downloaded`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subdir: relpath })
    })

    pipe(
      task,
      matchW(
        (l) => pushMessage(l, 'error'),
        (r) => files$.next(sub
          ? [{
            isDirectory: true,
            isVideo: false,
            modTime: '',
            name: '..',
            path: upperLevel,
            size: 0,
          }, ...r.filter(f => f.name !== '')]
          : r.filter(f => f.name !== '')
        )
      )
    )()
  }

  const selectable$ = useMemo(() => files$.pipe(
    combineLatestWith(selected$),
    map(([data, selected]) => data.map(x => ({
      ...x,
      selected: selected.includes(x.name)
    }))),
    share()
  ), [])

  const selectable = useObservable(selectable$, [])

  const addSelected = (name: string) => {
    selected$.value.includes(name)
      ? selected$.next(selected$.value.filter(val => val !== name))
      : selected$.next([...selected$.value, name])
  }

  const deleteFile = (entry: DirectoryEntry) => pipe(
    ffetch(`${serverAddr}/archive/delete`, {
      method: 'POST',
      body: JSON.stringify({
        path: entry.path,
      })
    }),
    matchW(
      (l) => pushMessage(l, 'error'),
      (_) => fetcher()
    )
  )()

  const deleteSelected = () => {
    Promise.all(selectable
      .filter(entry => entry.selected)
      .map(deleteFile)
    ).then(fetcher).then(() => selected$.next([]))
  }

  useEffect(() => {
    fetcher()
  }, [serverAddr])

  const onFileClick = (path: string) => startTransition(() => {
    const encoded = base64URLEncode(path)

    window.open(`${serverAddr}/archive/v/${encoded}?token=${localStorage.getItem('token')}`)
  })

  const downloadFile = (path: string) => startTransition(() => {
    const encoded = base64URLEncode(path)

    window.open(`${serverAddr}/archive/d/${encoded}?token=${localStorage.getItem('token')}`)
  })

  const onFolderClick = (path: string) => startTransition(() => {
    fetcherSubfolder(path)
  })

  const upMd = useMediaQuery<Theme>((theme) => theme.breakpoints.up('md'))

  return (
    <Container
      maxWidth="xl"
      sx={{ mt: 4, mb: 4, height: '100%' }}
      onClick={() => setShowMenu(false)}
    >
      <IconMenu
        posX={menuPos.x}
        posY={menuPos.y}
        hide={!showMenu}
        disableDelete={downloads.some(d => d.output.savedFilePath === currentFile?.path)}
        onDownload={() => {
          if (currentFile) {
            downloadFile(currentFile?.path)
            setCurrentFile(undefined)
          }
        }}
        onDelete={() => {
          if (currentFile) {
            deleteFile(currentFile)
            setCurrentFile(undefined)
          }
        }}
      />
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={!(files$.observed) || isPending}
      >
        <CircularProgress color="primary" />
      </Backdrop>
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={() => setShowMenu(false)}
      >
        <Typography py={1} variant="h5" color="primary">
          {i18n.t('archiveTitle')}
        </Typography>
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {selectable.length === 0 && <Typography sx={{ paddingX: 1 }}>{i18n.t('noFiles')}</Typography>}
          {selectable.map((file, idx) => (
            <ListItem
              onContextMenu={(e) => {
                e.preventDefault()
                setCurrentFile(file)
                setMenuPos({ x: e.clientX, y: e.clientY })
                setShowMenu(true)
              }}
              key={idx}
              secondaryAction={
                <div>
                  {!file.isDirectory && upMd && <Typography
                    variant="caption"
                    component="span"
                  >
                    {formatSize(file.size)}
                  </Typography>
                  }
                  {!file.isDirectory && <>
                    <Checkbox
                      disabled={downloads.some(d => d.output.savedFilePath === file.path)}
                      edge="end"
                      checked={file.selected}
                      onChange={() => addSelected(file.name)}
                    />
                  </>}
                </div>
              }
              disablePadding
            >
              <ListItemButton onClick={
                () => file.isDirectory
                  ? onFolderClick(file.path)
                  : onFileClick(file.path)
              }>
                <ListItemIcon>
                  {file.isDirectory
                    ? <FolderIcon />
                    : file.isVideo
                      ? <VideoFileIcon />
                      : <InsertDriveFileIcon />
                  }
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  primaryTypographyProps={{
                    sx: (theme) => ({
                      [theme.breakpoints.down('md')]: {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                      }
                    })
                  }}
                  secondary={<Stack direction={"column"}>
                    {file.name != '..' && new Date(file.modTime).toLocaleString()}
                    {!file.isDirectory && !upMd && (
                      <Typography variant="caption" component="span">
                        {formatSize(file.size)}
                      </Typography>
                    )}
                  </Stack>}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
      <SpeedDial
        ariaLabel='archive actions'
        sx={{ position: 'fixed', bottom: 64, right: 24, zIndex: { sm: 1201, xs: 1001 } }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<DeleteForeverIcon />}
          tooltipTitle={`Delete selected`}
          tooltipOpen
          onClick={() => {
            if (selected$.value.length > 0) {
              setOpenDialog(true)
            }
          }}
        />
      </SpeedDial>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>
          {i18n.t('confirm')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {i18n.t('confirm_prompt') + i18n.t('clear')}
          </DialogContentText>
          <ul>
            {selected$.value.map((entry, idx) => (
              <li key={idx}>{entry}</li>
            ))}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {i18n.t('cancel')}
          </Button>
          <Button
            onClick={() => {
              deleteSelected()
              setOpenDialog(false)
            }}
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

const IconMenu: React.FC<{
  posX: number
  posY: number
  hide: boolean
  onDownload: () => void
  onDelete: () => void
  disableDelete?: boolean
}> = ({ posX, posY, hide, onDelete, onDownload, disableDelete }) => {
  return (
    <Paper sx={{
      width: 320,
      maxWidth: '100%',
      position: 'absolute',
      top: posY,
      left: posX,
      display: hide ? 'none' : 'block',
      zIndex: (theme) => theme.zIndex.drawer + 1,
    }}>
      <MenuList>
        <MenuItem onClick={onDownload}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            Download
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={onDelete} disabled={disableDelete}>
          <ListItemIcon>
            <DeleteForeverIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            Delete
          </ListItemText>
        </MenuItem>
      </MenuList>
    </Paper>
  )
}