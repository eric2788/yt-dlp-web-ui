import { RouterProvider } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import { router } from './router'
import { Modal } from "@mui/material"

export function App() {
  return (
    <RecoilRoot>
      <RouterProvider router={router} />
    </RecoilRoot>
  )
}