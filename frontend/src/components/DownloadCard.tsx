import EightK from '@mui/icons-material/EightK'
import FourK from '@mui/icons-material/FourK'
import Hd from '@mui/icons-material/Hd'
import Sd from '@mui/icons-material/Sd'
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography
} from '@mui/material'
import { useCallback } from 'react'
import { useRecoilValue } from 'recoil'
import { serverURL } from '../atoms/settings'
import { RPCResult } from '../types'
import { base64URLEncode, ellipsis, formatSize, formatSpeedMiB, mapProcessStatus } from '../utils'
import styled from '@emotion/styled'

type Props = {
  download: RPCResult
  onStop: () => void
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

const DownloadCard: React.FC<Props> = ({ download, onStop, onCopy }) => {
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

  return (
    <Paper elevation={3} sx={{
      display: 'flex',
      width: '100%',
      flexDirection: 'column',
      height: '100%',
    }}>
      <Box>
        {download.info.thumbnail !== '' ?
          <CardMedia
            component="img"
            height={180}
            image={download.info.thumbnail}
          /> :
          <Skeleton variant="rectangular" height={180} />
        }
      </Box>
      <FlexColGrowBox p={1}>
        <FlexColGrowBox sx={{ paddingX: { sm: 1, xs: 0 }, paddingY: 1 }}>
          <Box sx={{ maxHeight: '64px' }}>
            {download.info.title !== '' ?
              <Typography gutterBottom variant="h6" component="div" sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {download.info.title}
              </Typography> :
              <>
                <Skeleton />
                <Skeleton width="60%" />
              </>
            }
          </Box>
          <Stack direction="row" spacing={0.5} py={1}>
            <Chip
              label={
                isCompleted()
                  ? 'Completed'
                  : mapProcessStatus(download.progress.process_status)
              }
              color="primary"
              size="small"
            />
            <Typography>
              {!isCompleted() ? download.progress.percentage : ''}
            </Typography>
            <Typography>
              &nbsp;
              {!isCompleted() ? formatSpeedMiB(download.progress.speed) : ''}
            </Typography>
            <Typography>
              {formatSize(download.info.filesize_approx ?? 0)}
            </Typography>
            <Resolution resolution={download.info.resolution} />
          </Stack>
        </FlexColGrowBox>
        <Box sx={{ display: 'flex', flexDirection: { sm: 'row', xs: 'column' }, gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={onStop}
          >
            {isCompleted() ? "Clear" : "Stop"}
          </Button>
          {isCompleted() &&
            <>
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={() => downloadFile(download.output.savedFilePath)}
              >
                Download
              </Button>
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={() => viewFile(download.output.savedFilePath)}
              >
                View
              </Button>
            </>
          }
        </Box>
      </FlexColGrowBox>
    </Paper>
  )
}

export default DownloadCard