import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Typography
} from '@mui/material'
import { ProcessStatus, RPCResult } from '../types'
import { base64URLEncode, ellipsis, formatSize, formatSpeedMiB, getExtension, mapProcessStatus } from '../utils'
import { useCallback, useState } from 'react'

import EightK from '@mui/icons-material/EightK'
import FourK from '@mui/icons-material/FourK'
import Hd from '@mui/icons-material/Hd'
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Sd from '@mui/icons-material/Sd'
import { fetcher } from "../lib/httpClient"
import { serverURL } from '../atoms/settings'
import styled from '@emotion/styled'
import { useI18n } from "../hooks/useI18n"
import { useModal } from "../hooks/modal"
import { useRPCOperation } from '../hooks/useRPC'
import { useRecoilValue } from 'recoil'
import { useToast } from '../hooks/toast'

type Props = {
  download: RPCResult
  onCopy: () => void
}

const Resolution: React.FC<{ resolution?: string }> = ({ resolution }) => {
  if (!resolution) return null
  if (resolution.includes('4320')) return <EightK color="primary" />
  if (resolution.includes('2160')) return <FourK color="primary" />
  if (resolution.includes('1080')) return <Hd color="primary" />
  if (resolution.includes('720')) return <Sd color="primary" />
  return null
}

const FlexColGrowBox = styled(Box)`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: space-between;
`

const DownloadCard: React.FC<Props> = ({ download, onCopy }) => {

  const serverAddr = useRecoilValue(serverURL)
  const isCompleted = useCallback(
    () => download.progress.percentage === '-1',
    [download.progress.percentage]
  )

  const percentageToNumber = useCallback(
    () => isCompleted()
      ? 100
      : Number(download.progress.percentage.replace('%', '')),
    [download.progress.percentage, isCompleted]
  )

  const viewFile = (path: string) => {
    const encoded = base64URLEncode(path)
    window.open(`${serverAddr}/archive/v/${encoded}?token=${localStorage.getItem('token')}`)
  }

  const downloadFile = (path: string) => {
    const encoded = base64URLEncode(path)
    window.open(`${serverAddr}/archive/d/${encoded}?token=${localStorage.getItem('token')}`)
  }

  const [stop, loading] = useRPCOperation(
    (r, client) => r.progress.process_status === ProcessStatus.COMPLETED
      ? client.clear(r.id)
      : client.kill(r.id)
  )

  const { pushMessage } = useToast()
  const { i18n } = useI18n()

  const [menuOpen, setMenuOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

  const { popupModal } = useModal()
  const confirmDelete = () => {
    popupModal({
      title: i18n.t('confirm'),
      content: `${i18n.t('confirm')} ${isCompleted() ? i18n.t('clear') : i18n.t('stop')} ${download.info.title}?`,
      buttons: [
        (close) => (
          <Button
            key="confirm"
            color="error"
            variant="outlined"
            onClick={() => {
              close()
              pushMessage(isCompleted() ? i18n.t('clearing') : i18n.t('stopping'), 'info')
              stop(download)
                .then(() => fetcher(`${serverAddr}/archive/delete`, {
                  method: 'POST',
                  body: JSON.stringify({
                    path: download.output.savedFilePath,
                  })
                }))
                .then(() => pushMessage(isCompleted() ? i18n.t('cleared') : i18n.t('stopped'), 'success'))
                .catch(err => {
                  console.error(err)
                  pushMessage(err.message || err, "error")
                })
            }}
          >
            {isCompleted() ? i18n.t('clear') : i18n.t('stop')}
          </Button>
        ),
        (close) => <Button key="cancel" variant="outlined" onClick={close}>{i18n.t('cancel')}</Button>,
      ]
    })
  }

  return (
    <Paper elevation={3} sx={{
      minWidth: '250px',
      display: 'flex',
      width: '100%',
      flexDirection: 'column',
      height: '100%',
    }}>
      <Box onClick={onCopy} sx={{ cursor: 'pointer' }}>
        {download.info.thumbnail !== '' ?
          <CardMedia
            component="img"
            height={180}
            image={download.info.thumbnail}
          /> :
          <Skeleton animation={[ProcessStatus.PENDING, ProcessStatus.DOWNLOADING].includes(download.progress.process_status) ? 'pulse' : false} variant="rectangular" height={180} />
        }
        {!isCompleted() && <LinearProgress variant={download.progress.process_status === ProcessStatus.DOWNLOADING ? 'determinate' : 'indeterminate'} value={percentageToNumber()} />}
      </Box>
      <FlexColGrowBox sx={{ paddingX: { sm: 2, xs: 1 }, paddingY: 1 }}>
        <FlexColGrowBox sx={{ paddingTop: 1 }}>
          <Box sx={{ maxHeight: '64px' }}>
            {download.info.title !== '' ?
              <Typography gutterBottom variant="h6" component="div"
                sx={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                }}>
                {download.info.title}
              </Typography> :
              <>
                <Skeleton />
                <Skeleton width="60%" />
              </>
            }
          </Box>
          <Stack direction="row" spacing={0.2} pt={0.5} sx={{ justifyContent: 'space-between', flexShrink: 1 }}>
            <Stack direction="row" gap={1}>
              <Chip
                label={
                  isCompleted()
                    ? 'Completed'
                    : mapProcessStatus(download.progress.process_status)
                }
                color={isCompleted() ? 'success' : 'primary'}
                size="small"
                variant="outlined"
              />
              <Chip
                label={'.' + getExtension(download.output.savedFilePath)}
                size="small"
                color="secondary"
                variant="outlined"
              />
              <Resolution resolution={download.info.resolution} />
              <Typography>
                {!isCompleted() ? download.progress.percentage : ''}
              </Typography>
              <Typography>
                &nbsp;
                {!isCompleted() ? formatSpeedMiB(download.progress.speed) : ''}
              </Typography>
            </Stack>
            <IconButton
              id="more-button"
              aria-controls={menuOpen ? 'more-menu' : undefined}
              aria-expanded={menuOpen ? 'true' : undefined}
              aria-haspopup="true"
              sx={{ display: { xs: 'inline', sm: 'none', padding: 0 } }}
              onClick={(e) => {
                setMenuOpen(true)
                setMenuAnchor(e.currentTarget)
              }}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="more-menu"
              MenuListProps={{ 'aria-labelledby': 'more-button' }}
              onClose={() => {
                setMenuAnchor(null)
                setMenuOpen(false)
              }}
              anchorEl={menuAnchor}
              open={menuOpen}
            >
              <MenuItem disabled={loading} onClick={() => viewFile(download.output.savedFilePath)}>{i18n.t('view')}</MenuItem>
              <MenuItem disabled={loading} onClick={() => downloadFile(download.output.savedFilePath)}>{i18n.t('download')}</MenuItem>
              <MenuItem disabled={loading} onClick={confirmDelete}>
                {isCompleted() ? i18n.t('clear') : i18n.t('stop')}
              </MenuItem>
            </Menu>
          </Stack>
        </FlexColGrowBox>
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: { sm: 'row', xs: 'column' }, gap: 1, paddingTop: 1.5 }}>
          {isCompleted() &&
            <>
              <Button
                disabled={loading}
                variant="contained"
                disableElevation
                color="primary"
                onClick={() => viewFile(download.output.savedFilePath)}
              >
                {i18n.t('view')}
              </Button>
              <Button
                disabled={loading}
                variant="contained"
                disableElevation
                color="primary"
                onClick={() => downloadFile(download.output.savedFilePath)}
              >
                {i18n.t('download')}
              </Button>
              <Button
                disabled={loading}
                variant="outlined"
                disableElevation
                color="error"
                onClick={confirmDelete}
              >
                {isCompleted() ? i18n.t('clear') : i18n.t('stop')}
              </Button>
            </>
          }
        </Box>
      </FlexColGrowBox>
    </Paper>
  )
}

export default DownloadCard