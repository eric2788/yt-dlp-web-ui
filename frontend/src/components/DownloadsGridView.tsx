import DownloadCard from './DownloadCard'
import { Grid } from '@mui/material'
import { activeDownloadsState } from '../atoms/downloads'
import { useI18n } from '../hooks/useI18n'
import { useRecoilValue } from 'recoil'
import { useToast } from '../hooks/toast'

const DownloadsGridView: React.FC = () => {
  const downloads = useRecoilValue(activeDownloadsState)

  const { i18n } = useI18n()
  const { pushMessage } = useToast()

  return (
    <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 12, xl: 12 }} pt={2}>
      {
        downloads.map(download => (
          <Grid item xs={4} sm={8} md={6} xl={4} key={download.id}>
            <DownloadCard
              download={download}
              onCopy={() => pushMessage(i18n.t('clipboardAction'), 'info')}
            />
          </Grid>
        ))
      }
    </Grid>
  )
}

export default DownloadsGridView