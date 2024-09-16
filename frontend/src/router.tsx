import { Box, CircularProgress } from '@mui/material'
import { Suspense, lazy } from 'react'
import { createHashRouter } from 'react-router-dom'
import Layout from './Layout'
import Terminal from './views/Terminal'

const Home = lazy(() => import('./views/Home'))
const Login = lazy(() => import('./views/Login'))
const Archive = lazy(() => import('./views/Archive'))
const Settings = lazy(() => import('./views/Settings'))
const LiveStream = lazy(() => import('./views/Livestream'))

const ErrorBoundary = lazy(() => import('./components/ErrorBoundary'))

const CenterCircularProgress = (
  <Box
    sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <CircularProgress />
  </Box>
)

export const router = createHashRouter([
  {
    path: '/',
    Component: () => <Layout />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={CenterCircularProgress}>
            <Home />
          </Suspense >
        ),
        errorElement: (
          <Suspense fallback={CenterCircularProgress}>
            <ErrorBoundary />
          </Suspense >
        )
      },
      {
        path: '/settings',
        element: (
          <Suspense fallback={CenterCircularProgress}>
            <Settings />
          </Suspense >
        )
      },
      {
        path: '/log',
        element: (
          <Suspense fallback={CenterCircularProgress}>
            <Terminal />
          </Suspense >
        )
      },
      {
        path: '/archive',
        element: (
          <Suspense fallback={CenterCircularProgress}>
            <Archive />
          </Suspense >
        ),
        errorElement: (
          <Suspense fallback={CenterCircularProgress}>
            <ErrorBoundary />
          </Suspense >
        )
      },
      {
        path: '/login',
        element: (
          <Suspense fallback={CenterCircularProgress}>
            <Login />
          </Suspense >
        )
      },
      {
        path: '/error',
        element: (
          <Suspense fallback={CenterCircularProgress}>
            <ErrorBoundary />
          </Suspense >
        )
      },
      {
        path: '/monitor',
        element: (
          <Suspense fallback={CenterCircularProgress}>
            <LiveStream />
          </Suspense >
        )
      },
    ]
  },
])