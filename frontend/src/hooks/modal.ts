import { AlertColor } from '@mui/material'
import { useRecoilState } from 'recoil'
import { toastListState } from '../atoms/toast'
import { Modal, modalState } from "../atoms/modal"

export const useModal = () => {
  const [, setModal] = useRecoilState(modalState)

  return {
    popupModal: (modal: Partial<Modal>) => {
      setModal({
        open: true,
        title: 'Title',
        content: 'content',
        buttons: [],
        ...modal
      })
    }
  }
}