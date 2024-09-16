import { AppBar, Box, CircularProgress, Divider, Toolbar } from '@mui/material'

import DownloadIcon from '@mui/icons-material/Download'
import FreeSpaceIndicator from './FreeSpaceIndicator'
import SettingsEthernet from '@mui/icons-material/SettingsEthernet'
import { Suspense } from 'react'
import VersionIndicator from './VersionIndicator'
import { connectedState } from '../atoms/status'
import { formatSpeedMiB } from '../utils'
import { settingsState } from '../atoms/settings'
import { totalDownloadSpeedState } from '../atoms/ui'
import { useI18n } from '../hooks/useI18n'
import { useRecoilValue } from 'recoil'

const Footer: React.FC = () => {
  const settings = useRecoilValue(settingsState)
  const isConnected = useRecoilValue(connectedState)
  const totalDownloadSpeed = useRecoilValue(totalDownloadSpeedState)

  const mode = settings.theme
  const { i18n } = useI18n()

  return (
    <AppBar position="fixed" color="default" sx={{
      top: 'auto',
      bottom: 0,
      zIndex: 1000,
      borderTop: mode === 'light'
        ? '1px solid rgba(0, 0, 0, 0.12)'
        : '1px solid rgba(255, 255, 255, 0.12)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      height: { md: 48 },
      
    }}>
      <Toolbar sx={{
        fontSize: 14,
        display: 'flex',
        gap: 1.5,
        paddingY: 1,
        paddingX: { sm: 3, xs: 1 },
        alignItems: { xs: 'start', md: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', md: 'row' },
      }}>
        <Suspense fallback={<CircularProgress size={15} />}>
          <VersionIndicator />
        </Suspense>
        <div style={{ display: 'flex', gap: 4, 'alignItems': 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginRight: 'px',
            gap: 3,
          }}>
            <DownloadIcon />
            <span>
              {formatSpeedMiB(totalDownloadSpeed)}
            </span>
          </div>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 2, justifyContent: 'end' }}>
            <SettingsEthernet />
            <span>
              {isConnected ? settings.serverAddr : i18n.t('notConnectedText')}
            </span>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Suspense fallback={i18n.t('loadingLabel')}>
              <FreeSpaceIndicator />
            </Suspense>
          </Box>
        </div>
      </Toolbar>
    </AppBar>
  )
}

export default Footer