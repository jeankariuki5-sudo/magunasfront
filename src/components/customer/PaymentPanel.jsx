import { useContext, useEffect, useRef, useState } from 'react'
import api from '../api/api'
import { AuthContext } from '../context/AuthContext'

// Polls payment_status every few seconds after an STK push is sent.
const POLL_INTERVAL_MS = 3000
const MAX_POLLS = 20 // ~1 minute

const PaymentPanel = ({ orderId, amount, onPaid }) => {
    const { user } = useContext(AuthContext)
    const [phone, setPhone] = useState(user?.phone_number || '')
    const [stage, setStage] = useState('idle') // idle | sending | polling | success | failed | timeout
    const [error, setError] = useState('')
    const [receipt, setReceipt] = useState('')
    const pollCount = useRef(0)
    const pollTimer = useRef(null)

    useEffect(() => () => clearTimeout(pollTimer.current), [])

    const pollStatus = () => {
        pollTimer.current = setTimeout(async () => {
            try {
                const res = await api.get(`payments/payment_status/${orderId}/`)
                const paymentStatus = res.data.payment_status

                if (paymentStatus === 'success') {
                    setReceipt(res.data.mpesa_receipt || '')
                    setStage('success')
                    onPaid?.(res.data)
                    return
                }
                if (paymentStatus === 'failed') {
                    setStage('failed')
                    return
                }

                pollCount.current += 1
                if (pollCount.current >= MAX_POLLS) {
                    setStage('timeout')
                    return
                }
                pollStatus()
            } catch {
                setStage('timeout')
            }
        }, POLL_INTERVAL_MS)
    }

    const handleSendPush = async () => {
        setError('')
        if (!phone.trim()) {
            setError('Enter the M-Pesa phone number to pay with')
            return
        }
        setStage('sending')
        try {
            await api.post(`payments/make_payment/${orderId}/`, { phone_number: phone, amount })
            setStage('polling')
            pollCount.current = 0
            pollStatus()
        } catch (err) {
            setStage('idle')
            setError(err.response?.data?.error || 'Failed to send M-Pesa prompt')
        }
    }

    if (stage === 'success') {
        return (
            <div className="card text-center">
                <i className="bi bi-check-circle text-3xl text-brand-green-deep dark:text-brand-green mb-2" />
                <p className="font-semibold text-brand-black dark:text-white">Payment received</p>
                {receipt && <p className="text-xs text-faint mt-1">M-Pesa receipt: {receipt}</p>}
            </div>
        )
    }

    return (
        <div className="card">
            <p className="section-title text-sm">Pay with M-Pesa</p>

            {stage === 'polling' && (
                <div className="text-center py-4">
                    <p className="text-sm text-brand-black dark:text-white font-semibold mb-1">Check your phone</p>
                    <p className="text-xs text-muted">Enter your M-Pesa PIN to complete the KES {amount} payment.</p>
                </div>
            )}

            {stage === 'failed' && (
                <div className="alert-error mb-3">Payment failed or was cancelled. You can try again below.</div>
            )}

            {stage === 'timeout' && (
                <div className="alert-error mb-3">Still waiting to hear back from M-Pesa. If you completed the prompt, this should update shortly — otherwise try again.</div>
            )}

            {error && <div className="alert-error mb-3">{error}</div>}

            {(stage === 'idle' || stage === 'sending' || stage === 'failed' || stage === 'timeout') && (
                <>
                    <label className="text-sm text-muted block mb-1">M-Pesa phone number</label>
                    <input
                        type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                        placeholder="07XXXXXXXX"
                        className="input-field mb-3"
                    />
                    <button onClick={handleSendPush} disabled={stage === 'sending'} className="btn-primary-block">
                        {stage === 'sending' ? 'Sending prompt...' : `Pay KES ${amount}`}
                    </button>
                </>
            )}
        </div>
    )
}

export default PaymentPanel
