import { Chip } from '@mui/material'
import { useRecoilValue } from 'recoil'
import { ytdlpRpcVersionState } from '../atoms/status'

const VersionIndicator: React.FC = () => {
  const version = useRecoilValue(ytdlpRpcVersionState)

  return (
    <>
      <Chip label={`RPC v${version.rpcVersion}`} variant="outlined" size="small" />
      <Chip label={`yt-dlp v${version.ytdlpVersion}`} variant="outlined" size="small" />
    </>
  )
}

export default VersionIndicator