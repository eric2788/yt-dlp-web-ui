import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { useI18n } from '../../hooks/useI18n'

type Props = {
  onOpen: () => void
  onStopAll: () => void
}

const LivestreamSpeedDial: React.FC<Props> = ({ onOpen, onStopAll }) => {
  const { i18n } = useI18n()

  return (
    <SpeedDial
      ariaLabel="Home speed dial"
      sx={{ position: 'fixed', bottom: 64, right: 24, zIndex: { sm: 1201, xs: 1001 } }}
      icon={<SpeedDialIcon />}
    >
      <SpeedDialAction
        icon={<DeleteForeverIcon />}
        tooltipTitle={i18n.t('abortAllButton')}
        onClick={onStopAll}
      />
      <SpeedDialAction
        icon={<AddCircleIcon />}
        tooltipTitle={i18n.t('newDownloadButton')}
        onClick={onOpen}
      />
    </SpeedDial>
  )
}

export default LivestreamSpeedDial