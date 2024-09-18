import { ReactNode } from "react"
import { atom } from 'recoil'

export type Modal = {
    open: boolean,
    title: string,
    content: ReactNode,
    buttons: ((cancel: () => void) => ReactNode)[]
}

export const modalState = atom<Modal>({
    key: 'modalState',
    default: undefined,
})