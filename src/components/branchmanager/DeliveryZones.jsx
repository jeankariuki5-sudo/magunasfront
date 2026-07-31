import { useEffect, useState } from 'react'
import api from '../api/api'
import DashboardLayout from '../DashboardLayout'
import DeliveryZoneManager from '../DeliveryZoneManager'

const DeliveryZones = () => {
    const [branch, setBranch] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        api.get('branches/my_branch/')
            .then((res) => setBranch(res.data))
            .catch((err) => setError(err.response?.data?.error || 'Failed to load your branch'))
    }, [])

    return (
        <DashboardLayout title="Delivery Zones">
            <div className="max-w-2xl mx-auto">
                {error && <div className="alert-error mb-4">{error}</div>}
                {/* No branchId passed - DeliveryZoneManager falls back to the
                    "my branch" endpoints, scoped server-side to this manager. */}
                <DeliveryZoneManager branchName={branch?.branch_name} />
            </div>
        </DashboardLayout>
    )
}

export default DeliveryZones
