/**
 * One-time script to seed the database with mock flights for testing
 * Run with: pnpm tsx scripts/seed-flights.ts
 */

const API_URL = 'http://localhost:8000'

// Mock flights data
const mockFlights = [
  // Arrivals
  {
    type: "arrival",
    tailNumber: "N525JT",
    aircraftType: "Gulfstream G550",
    origin: "KTEB",
    scheduledTime: "14:30",
    scheduledDate: new Date().toISOString().split("T")[0],
    duration: 90,
    status: "ARRIVED",
  },
  {
    type: "arrival",
    tailNumber: "N847PA",
    aircraftType: "Citation X",
    origin: "KMIA",
    scheduledTime: "15:45",
    scheduledDate: new Date().toISOString().split("T")[0],
    duration: 60,
    status: "EN_ROUTE",
  },
  {
    type: "arrival",
    tailNumber: "N123AB",
    aircraftType: "King Air 350",
    origin: "KBOS",
    scheduledTime: "16:15",
    scheduledDate: new Date().toISOString().split("T")[0],
    duration: 75,
    status: "DELAYED",
  },
  {
    type: "arrival",
    tailNumber: "N789XY",
    aircraftType: "Challenger 350",
    origin: "KORD",
    scheduledTime: "17:00",
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    duration: 120,
    status: "SCHEDULED",
  },
  {
    type: "arrival",
    tailNumber: "N456CD",
    aircraftType: "Phenom 300",
    origin: "KDCA",
    scheduledTime: "18:30",
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    duration: 45,
    status: "SCHEDULED",
  },
  // Departures
  {
    type: "departure",
    tailNumber: "N321GH",
    aircraftType: "Falcon 7X",
    destination: "KLAX",
    scheduledTime: "13:00",
    scheduledDate: new Date().toISOString().split("T")[0],
    duration: 90,
    status: "DEPARTED",
  },
  {
    type: "departure",
    tailNumber: "N654IJ",
    aircraftType: "Citation Latitude",
    destination: "KPBI",
    scheduledTime: "15:00",
    scheduledDate: new Date().toISOString().split("T")[0],
    duration: 60,
    status: "SCHEDULED",
  },
  {
    type: "departure",
    tailNumber: "N987KL",
    aircraftType: "Global 6000",
    destination: "EGLL",
    scheduledTime: "16:30",
    scheduledDate: new Date(Date.now() + 172800000).toISOString().split("T")[0],
    duration: 150,
    status: "SCHEDULED",
  },
  {
    type: "departure",
    tailNumber: "N246MN",
    aircraftType: "Hawker 900XP",
    destination: "KAUS",
    scheduledTime: "17:45",
    scheduledDate: new Date(Date.now() + 259200000).toISOString().split("T")[0],
    duration: 75,
    status: "SCHEDULED",
  },
  {
    type: "departure",
    tailNumber: "N135OP",
    aircraftType: "Premier 1A",
    destination: "KSEA",
    scheduledTime: "19:00",
    scheduledDate: new Date().toISOString().split("T")[0],
    duration: 60,
    status: "CANCELLED",
  },
  {
    type: "departure",
    tailNumber: "N802QR",
    aircraftType: "Learjet 75",
    destination: "KDEN",
    scheduledTime: "20:15",
    scheduledDate: new Date(Date.now() + 345600000).toISOString().split("T")[0],
    duration: 90,
    status: "SCHEDULED",
  },
]

async function login() {
  const response = await fetch(`${API_URL}/api/auth/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'admin123',
    }),
  })

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.access
}

async function createFlight(token: string, flight: any) {
  const datetime = `${flight.scheduledDate}T${flight.scheduledTime}:00`

  const requestData = {
    flight_number: flight.tailNumber,
    aircraft: flight.tailNumber,
    destination: flight.type === 'departure' ? flight.destination : flight.origin,
    arrival_time: flight.type === 'arrival' ? datetime : undefined,
    departure_time: flight.type === 'departure' ? datetime : undefined,
    flight_status: flight.status,
  }

  const response = await fetch(`${API_URL}/api/flights/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(requestData),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create flight ${flight.tailNumber}: ${error}`)
  }

  return response.json()
}

async function seedFlights() {
  console.log('🚀 Starting flight database seeding...')

  try {
    // Login
    console.log('🔐 Logging in...')
    const token = await login()
    console.log('✅ Login successful')

    // Create flights
    console.log(`📝 Creating ${mockFlights.length} flights...`)
    let successCount = 0
    let errorCount = 0

    for (const flight of mockFlights) {
      try {
        await createFlight(token, flight)
        console.log(`✅ Created flight: ${flight.tailNumber} (${flight.type})`)
        successCount++
      } catch (error) {
        console.error(`❌ Failed to create flight ${flight.tailNumber}:`, error)
        errorCount++
      }
    }

    console.log('\n📊 Summary:')
    console.log(`   ✅ Successfully created: ${successCount}`)
    console.log(`   ❌ Failed: ${errorCount}`)
    console.log('\n🎉 Seeding complete!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedFlights()
