'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// This is mock data. In a real application, you'd fetch this from your API.
const mockData = [
  { date: '2023-05-01', scans: 45 },
  { date: '2023-05-02', scans: 52 },
  { date: '2023-05-03', scans: 49 },
  { date: '2023-05-04', scans: 63 },
  { date: '2023-05-05', scans: 58 },
  { date: '2023-05-06', scans: 64 },
  { date: '2023-05-07', scans: 75 },
]

export default function AnalyticsPage() {
  const params = useParams()
  const [analytics, setAnalytics] = useState(mockData)

  useEffect(() => {
    // In a real application, you'd fetch the analytics data here
    // based on the QR code ID from params.id
    console.log('Fetching analytics for QR code:', params.id)
  }, [params.id])

  return (
    <div className="container mx-auto p-8">
      <Card className="hover-lift glassmorphism">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">QR Code Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="scans" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

