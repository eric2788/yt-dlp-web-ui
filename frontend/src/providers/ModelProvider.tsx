import { Alert, Backdrop, Box, Dialog, DialogActions, DialogContent, DialogTitle, Fade, Modal, Snackbar, Stack, Typography } from "@mui/material"
import { useRecoilState } from 'recoil'
import { Toast, toastListState } from '../atoms/toast'
import { useEffect } from 'react'
import { modalState } from "../atoms/modal"


const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


const ModalProvider: React.FC = () => {
    const [modal, setModal] = useRecoilState(modalState)

    const close = () => {
        setModal({
            open: false,
            title: '',
            content: null,
            buttons: []
        })
    }

    return (
        <Dialog
            open={modal?.open ?? false}
            onClose={close}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{modal?.title}</DialogTitle>
            <DialogContent>
                {modal?.content}
            </DialogContent>
            <DialogActions>
                {modal?.buttons?.map((btn) => btn(close))}
            </DialogActions>
        </Dialog>

    )
}

export default ModalProvider