import { styled } from '@mui/material'
import MuiDrawer from '@mui/material/Drawer'

const drawerWidth = 240

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => true })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      [theme.breakpoints.up('sm')]: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        boxSizing: 'border-box',
        ...(!open && {
          overflowX: 'hidden',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          width: theme.spacing(7),
          [theme.breakpoints.up('md')]: {
            width: theme.spacing(9),
          },
        }),
      }
    },
  }),
)

export default Drawer