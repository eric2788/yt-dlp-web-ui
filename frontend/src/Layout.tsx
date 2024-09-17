import { Box, createTheme, useMediaQuery } from '@mui/material'
import { Link, Outlet } from 'react-router-dom'
import { useMemo, useState } from 'react'

import AppBar from './components/AppBar'
import ArchiveIcon from '@mui/icons-material/Archive'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import CssBaseline from '@mui/material/CssBaseline'
import Dashboard from '@mui/icons-material/Dashboard'
import Divider from '@mui/material/Divider'
import Drawer from './components/Drawer'
import Footer from './components/Footer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import LiveTvIcon from '@mui/icons-material/LiveTv'
import Logout from './components/Logout'
import Menu from '@mui/icons-material/Menu'
import SettingsIcon from '@mui/icons-material/Settings'
import SocketSubscriber from './components/SocketSubscriber'
import TerminalIcon from '@mui/icons-material/Terminal'
import { ThemeProvider } from '@emotion/react'
import ThemeToggler from './components/ThemeToggler'
import Toaster from './providers/ToasterProvider'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { grey } from '@mui/material/colors'
import { settingsState } from './atoms/settings'
import { useI18n } from './hooks/useI18n'
import { useRecoilValue } from 'recoil'

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true;
    ms: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
  }
}

export default function Layout() {
  const [open, setOpen] = useState(false)

  const settings = useRecoilValue(settingsState)

  const mode = settings.theme
  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: settings.theme,
        background: {
          default: settings.theme === 'light' ? grey[50] : '#121212'
        },
      },
      breakpoints: {
        values: {
          xs: 0,
          ms: 350,
          sm: 600,
          md: 900,
          lg: 1200,
          xl: 1536,
        },
      },
    }), [settings.theme]
  )

  const toggleDrawer = () => setOpen(state => !state)

  const { i18n } = useI18n()

  const upSm = useMediaQuery(theme.breakpoints.up('sm'))

  return (
    <ThemeProvider theme={theme}>
      <SocketSubscriber />
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar sx={{ pr: '24px' }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(open && { display: { sm: 'none' } }),
              }}
            >
              <Menu />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              
            >
              {settings.appTitle}
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant={upSm ? 'permanent' : 'temporary'} open={open} onClose={() => setOpen(false)}>
          <Toolbar
            sx={{
              display: { sm: 'flex', xs: 'none' },
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeft />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            <Link to={'/'} style={
              {
                textDecoration: 'none',
                color: mode === 'dark' ? '#ffffff' : '#000000DE'
              }
            }>
              <ListItemButton>
                <ListItemIcon>
                  <Dashboard />
                </ListItemIcon>
                <ListItemText primary={i18n.t('homeButtonLabel')} />
              </ListItemButton>
            </Link>
            <Link to={'/archive'} style={
              {
                textDecoration: 'none',
                color: mode === 'dark' ? '#ffffff' : '#000000DE'
              }
            }>
              <ListItemButton>
                <ListItemIcon>
                  <ArchiveIcon />
                </ListItemIcon>
                <ListItemText primary={i18n.t('archiveButtonLabel')} />
              </ListItemButton>
            </Link>
            <Link to={'/monitor'} style={
              {
                textDecoration: 'none',
                color: mode === 'dark' ? '#ffffff' : '#000000DE'
              }
            }>
              <ListItemButton>
                <ListItemIcon>
                  <LiveTvIcon />
                </ListItemIcon>
                <ListItemText primary={i18n.t('archiveButtonLabel')} />
              </ListItemButton>
            </Link>
            <Link to={'/log'} style={
              {
                textDecoration: 'none',
                color: mode === 'dark' ? '#ffffff' : '#000000DE'
              }
            }>
              <ListItemButton>
                <ListItemIcon>
                  <TerminalIcon />
                </ListItemIcon>
                <ListItemText primary={i18n.t('logsTitle')} />
              </ListItemButton>
            </Link>
            <Link to={'/settings'} style={
              {
                textDecoration: 'none',
                color: mode === 'dark' ? '#ffffff' : '#000000DE'
              }
            }>
              <ListItemButton>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary={i18n.t('settingsButtonLabel')} />
              </ListItemButton>
            </Link>
            <ThemeToggler />
            <Logout />
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
      <Footer />
      <Toaster />
    </ThemeProvider>
  )
}