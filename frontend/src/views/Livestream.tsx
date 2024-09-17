import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { LiveStreamProgress, LiveStreamStatus, ProcessStatus } from '../types'
import { useRPC, useRPCOperation } from '../hooks/useRPC'

import LivestreamDialog from '../components/livestream/LivestreamDialog'
import LivestreamSpeedDial from '../components/livestream/LivestreamSpeedDial'
import LoadingBackdrop from '../components/LoadingBackdrop'
import NoLivestreams from '../components/livestream/NoLivestreams'
import { interval } from 'rxjs'
import { useI18n } from '../hooks/useI18n'
import { useState } from 'react'
import { useSubscription } from '../hooks/observable'
import { useToast } from '../hooks/toast'

const LiveStreamMonitorView: React.FC = () => {
  const { i18n } = useI18n()
  const { client } = useRPC()

  const [progress, setProgress] = useState<LiveStreamProgress>()
  const [openDialog, setOpenDialog] = useState(false)

  useSubscription(interval(1000), () => {
    client
      .progressLivestream()
      .then(r => setProgress(r.result))
  })

  const formatMicro = (microseconds: number) => {
    const ms = microseconds / 1_000_000
    let s = ms / 1000

    const hr = s / 3600
    s %= 3600

    const mt = s / 60
    s %= 60

    //           huh?
    const ss = (Math.abs(s - 1)).toFixed(0).padStart(2, '0')
    const mts = mt.toFixed(0).padStart(2, '0')
    const hrs = hr.toFixed(0).padStart(2, '0')

    return `${hrs}:${mts}:${ss}`
  }

  const mapStatusToChip = (status: LiveStreamStatus): React.ReactNode => {
    switch (status) {
      case LiveStreamStatus.WAITING:
        return <Chip label='Waiting/Wait start' color='warning' size='small' />
      case LiveStreamStatus.IN_PROGRESS:
        return <Chip label='Downloading' color='primary' size='small' />
      case LiveStreamStatus.COMPLETED:
        return <Chip label='Completed' color='success' size='small' />
      case LiveStreamStatus.ERRORED:
        return <Chip label='Errored' color='error' size='small' />
      default:
        return <Chip label='Unknown state' color='secondary' size='small' />
    }
  }

  const { pushMessage } = useToast()
  const [stop, loading] = useRPCOperation<string | undefined>(
    (url, c) => url ? c.killLivestream(url) : c.killAllLivestream()
  )

  return (
    <>
      <LoadingBackdrop isLoading={!progress} />

      <LivestreamSpeedDial
        onOpen={() => setOpenDialog(s => !s)}
        onStopAll={() => {
          pushMessage(i18n.t('livestreamStoppingAll'), 'info')
          stop(undefined)
            .then(() => pushMessage(i18n.t('livestreamStoppedAll'), 'success'))
            .catch(err => pushMessage(err.message, 'error'))
        }} 
      />
      <LivestreamDialog open={openDialog} onClose={() => setOpenDialog(s => !s)} />

      {!progress || Object.keys(progress).length === 0 ?
        <NoLivestreams /> :
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
          <Paper sx={{
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '80vh',
          }}>
            <TableContainer component={Box}>
              <Table sx={{ minWidth: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>{i18n.t('livestreamURLInput')}</TableCell>
                    <TableCell align="right">Status</TableCell>
                    <TableCell align="right">Time to live</TableCell>
                    <TableCell align="right">Starts on</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {progress && Object.keys(progress).map(k => (
                    <TableRow
                      key={k}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>{k}</TableCell>
                      <TableCell align='right'>
                        {mapStatusToChip(progress[k].status)}
                      </TableCell>
                      <TableCell align='right'>
                        {progress[k].status === LiveStreamStatus.WAITING
                          ? formatMicro(Number(progress[k].waitTime))
                          : "-"
                        }
                      </TableCell>
                      <TableCell align='right'>
                        {progress[k].status === LiveStreamStatus.WAITING
                          ? new Date(progress[k].liveDate).toLocaleString()
                          : "-"
                        }
                      </TableCell>
                      <TableCell align='right'>
                        <Button disabled={loading} variant='contained' size='small' onClick={() => {
                          pushMessage(i18n.t('livestreamStopping'), 'info')
                          stop(k)
                            .then(() => pushMessage(i18n.t('livestreamStopped'), 'success'))
                            .catch(err => pushMessage(err.message, 'error'))
                        }}>
                          Stop
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>}
    </>
  )
}

export default LiveStreamMonitorView