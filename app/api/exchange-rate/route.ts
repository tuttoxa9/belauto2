import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://api.nbrb.by/exrates/rates/431', {
      headers: {
        'User-Agent': 'AutoBelCenter/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      rate: data.Cur_OfficialRate,
      date: data.Date,
      currency: data.Cur_Abbreviation
    })
  } catch (error) {
    console.error('Error fetching exchange rate:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exchange rate' },
      { status: 500 }
    )
  }
}
