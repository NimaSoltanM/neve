import { useEffect } from 'react'
import { finalizeEndedAuctions } from '../actions/finalize-ended-auctions.action'

export function useAuctionChecker() {
  useEffect(() => {
    const lastCheck = localStorage.getItem('lastAuctionCheck')
    const now = Date.now()

    // Check every 60 seconds max
    if (!lastCheck || now - parseInt(lastCheck) > 20000) {
      localStorage.setItem('lastAuctionCheck', now.toString())
      finalizeEndedAuctions().catch(console.error)
    }
  }, [])
}
