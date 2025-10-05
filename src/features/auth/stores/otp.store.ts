import { atom } from 'jotai'

interface OtpState {
  code: string | null
  phoneNumber: string | null
  expiresAt: number | null
}

export const otpAtom = atom<OtpState>({
  code: null,
  phoneNumber: null,
  expiresAt: null,
})
