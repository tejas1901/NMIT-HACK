import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://iwcqkrzefoawlpugergc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncDatabase() {
  console.log("=== Synchronizing & Cleaning Supabase Database ===");

  // 1. Clean shipment_datasets: Delete bulk rows and keep only 5 clean sample rows
  console.log("\n[1] Updating shipment_datasets...");
  const { data: allDs, error: dsErr } = await supabase.from('shipment_datasets').select('id').order('created_at', { ascending: false });
  if (dsErr) {
    console.error("Error fetching shipment_datasets:", dsErr.message);
  } else if (allDs && allDs.length > 5) {
    const idsToDelete = allDs.slice(5).map(r => r.id);
    console.log(`Pruning ${idsToDelete.length} extra dataset records, keeping top 5 sample records...`);
    
    // Delete in batches of 100
    for (let i = 0; i < idsToDelete.length; i += 100) {
      const batch = idsToDelete.slice(i, i + 100);
      const { error: delErr } = await supabase.from('shipment_datasets').delete().in('id', batch);
      if (delErr) {
        console.error(`Error deleting batch ${i}:`, delErr.message);
      }
    }
  }

  const { count: finalDsCount } = await supabase.from('shipment_datasets').select('*', { count: 'exact', head: true });
  console.log(`shipment_datasets now contains: ${finalDsCount} records.`);

  // 2. Clean shipment_incidents: Keep only 4 clean corridor disruption incidents
  console.log("\n[2] Updating shipment_incidents...");
  const { data: allInc, error: incErr } = await supabase.from('shipment_incidents').select('id').order('created_at', { ascending: false });
  if (incErr) {
    console.error("Error fetching shipment_incidents:", incErr.message);
  } else if (allInc && allInc.length > 4) {
    const incIdsToDelete = allInc.slice(4).map(r => r.id);
    console.log(`Pruning ${incIdsToDelete.length} extra incident records, keeping top 4 incidents...`);
    
    for (let i = 0; i < incIdsToDelete.length; i += 100) {
      const batch = incIdsToDelete.slice(i, i + 100);
      const { error: delErr } = await supabase.from('shipment_incidents').delete().in('id', batch);
      if (delErr) {
        console.error(`Error deleting batch ${i}:`, delErr.message);
      }
    }
  }

  const { count: finalIncCount } = await supabase.from('shipment_incidents').select('*', { count: 'exact', head: true });
  console.log(`shipment_incidents now contains: ${finalIncCount} records.`);

  // 3. Clean cargo_bookings: Remove temporary test artifacts and ensure clean 5 core consignments
  console.log("\n[3] Updating cargo_bookings...");
  // Delete temporary test bookings
  const { error: testDelErr } = await supabase.from('cargo_bookings').delete().like('booking_ref', '%TEST%');
  if (testDelErr) {
    console.error("Error deleting test bookings:", testDelErr.message);
  }

  // Also check total remaining cargo_bookings; keep 5 clean commercial bookings
  const { data: allBookings, error: bErr } = await supabase.from('cargo_bookings').select('id, booking_ref').order('created_at', { ascending: false });
  if (bErr) {
    console.error("Error fetching cargo_bookings:", bErr.message);
  } else if (allBookings && allBookings.length > 5) {
    const bookingIdsToDelete = allBookings.slice(5).map(r => r.id);
    console.log(`Pruning ${bookingIdsToDelete.length} extra booking records, keeping clean 5 consignments...`);
    const { error: delErr } = await supabase.from('cargo_bookings').delete().in('id', bookingIdsToDelete);
    if (delErr) {
      console.error("Error deleting extra bookings:", delErr.message);
    }
  }

  const { data: finalBookings } = await supabase.from('cargo_bookings').select('id, booking_ref, origin, destination, status');
  console.log(`cargo_bookings now contains: ${finalBookings?.length} records:`);
  console.table(finalBookings);

  console.log("\n=== Supabase Database Successfully Synchronized & Cleaned! ===");
}

syncDatabase().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
