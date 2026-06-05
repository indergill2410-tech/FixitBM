import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const allowProduction = process.env.ALLOW_DEMO_SEED === "true";
const isProduction = process.env.NODE_ENV === "production";

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY before running demo seed.");
}

if (isProduction && !allowProduction) {
  throw new Error("Refusing to seed demo data in production unless ALLOW_DEMO_SEED=true.");
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const customerSeeds = [
  ["maya.chen.demo@fixit247.test", "Maya", "Chen", "0411000001", "Parramatta"],
  ["oliver.hughes.demo@fixit247.test", "Oliver", "Hughes", "0411000002", "Ryde"],
  ["sarah.patel.demo@fixit247.test", "Sarah", "Patel", "0411000003", "Blacktown"],
  ["jack.wilson.demo@fixit247.test", "Jack", "Wilson", "0411000004", "Surry Hills"],
  ["amrita.kaur.demo@fixit247.test", "Amrita", "Kaur", "0411000005", "Chatswood"]
];

const tradieSeeds = [
  ["harbour.plumbing.demo@fixit247.test", "Noah", "Miller", "Harbour Plumbing Co", "Plumbing", "Parramatta"],
  ["sparkright.demo@fixit247.test", "Grace", "Taylor", "SparkRight Electrical", "Electrical", "Ryde"],
  ["lockfast.demo@fixit247.test", "Liam", "Nguyen", "LockFast 24", "Locksmith", "Sydney CBD"],
  ["roadrescue.demo@fixit247.test", "Ava", "Brown", "Road Rescue NSW", "Mechanic", "Blacktown"],
  ["glassmate.demo@fixit247.test", "Ethan", "Singh", "GlassMate Repairs", "Glass repair", "Parramatta"],
  ["roofline.demo@fixit247.test", "Chloe", "Evans", "Roofline Emergency", "Roof leak", "Surry Hills"],
  ["coolair.demo@fixit247.test", "Lucas", "Scott", "CoolAir Rapid", "Heating/cooling", "Chatswood"],
  ["tyreteam.demo@fixit247.test", "Zara", "Ali", "Tyre Team Mobile", "Flat tyre", "Blacktown"],
  ["batteryboost.demo@fixit247.test", "Henry", "Martin", "Battery Boost", "Battery", "Ryde"],
  ["towpro.demo@fixit247.test", "Isla", "White", "TowPro Sydney", "Towing", "Sydney CBD"]
];

const jobTemplates = [
  ["home", "Plumbing", "Burst pipe under kitchen sink", "Water is leaking under the sink and spreading across the kitchen.", "emergency"],
  ["road", "Flat tyre", "Flat tyre on M4 shoulder", "Front left tyre is flat and the customer is waiting near the exit.", "emergency"],
  ["home", "Electrical", "Power outage in half the house", "Lights and outlets are out in the back rooms.", "emergency"],
  ["home", "Locksmith", "Locked out after work", "Customer is locked outside apartment with keys inside.", "emergency"],
  ["road", "Battery", "Dead battery in driveway", "Vehicle will not start and customer needs school pickup.", "today"],
  ["home", "Roof leak", "Roof leak after rain", "Water marks appearing in upstairs bedroom ceiling.", "today"],
  ["road", "Vehicle lockout", "Keys locked in car", "Keys are visible inside the parked car.", "emergency"],
  ["home", "Glass repair", "Broken back door glass", "Glass panel cracked and needs urgent make-safe.", "today"],
  ["home", "Appliance issue", "Washing machine flooding laundry", "Machine is leaking during cycle.", "today"],
  ["road", "Towing", "Vehicle needs towing", "Car stalled and needs tow coordination.", "emergency"],
  ["home", "Heating/cooling", "Air conditioner stopped working", "AC failed during hot weather.", "flexible"],
  ["home", "Handyman", "Door hinge repair", "Front door hinge is loose.", "flexible"],
  ["home", "Pest emergency", "Wasp nest near entry", "Nest is near the front door and children are home.", "today"],
  ["road", "Fuel emergency", "Ran out of fuel", "Customer is parked safely but cannot continue.", "today"],
  ["home", "Cleaning", "Emergency water cleanup", "Small flood cleanup after plumbing issue.", "today"],
  ["home", "Plumbing", "Blocked toilet", "Only toilet in home is blocked.", "emergency"],
  ["home", "Electrical", "Burning smell near switchboard", "Customer noticed smell and turned off power.", "emergency"],
  ["road", "Mechanic", "Car overheating", "Temperature warning came on near Chatswood.", "today"],
  ["home", "Roof leak", "Storm water entering garage", "Water is entering around garage ceiling.", "emergency"],
  ["home", "Locksmith", "Tenant lock change", "Landlord needs lock changed after tenant move-out.", "flexible"]
];

const password = "Fixit247Demo!2026";

async function createAuthUser(email, firstName, lastName, role) {
  const { data: created, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName, role }
  });

  if (error && !error.message.toLowerCase().includes("already")) {
    throw error;
  }

  if (created?.user) return created.user.id;

  const { data: listed, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  return listed.users.find((user) => user.email === email)?.id ?? null;
}

async function seedUsers() {
  const customers = [];
  const tradies = [];

  for (const [email, firstName, lastName, phone, suburb] of customerSeeds) {
    const authId = await createAuthUser(email, firstName, lastName, "customer");
    const { data: user, error } = await supabase
      .from("users")
      .upsert(
        { auth_id: authId, email, first_name: firstName, last_name: lastName, phone, role: "customer", status: "active" },
        { onConflict: "email" }
      )
      .select("id")
      .single();
    if (error) throw error;

    await supabase.from("customer_profiles").upsert({ user_id: user.id }, { onConflict: "user_id" });
    await supabase.from("saved_properties").upsert(
      {
        customer_id: user.id,
        label: "Home",
        address: `12 Demo Street`,
        suburb,
        postcode: "2000",
        state: "NSW",
        is_default: true
      },
      { onConflict: "id" }
    );
    await supabase.from("saved_vehicles").insert({
      customer_id: user.id,
      label: "Family car",
      make: "Toyota",
      model: "RAV4",
      year: 2021,
      registration: `DEMO${customers.length + 1}`,
      fuel_type: "petrol",
      is_default: true
    });

    customers.push({ ...user, email, firstName, phone, suburb });
  }

  for (const [email, firstName, lastName, businessName, category, suburb] of tradieSeeds) {
    const authId = await createAuthUser(email, firstName, lastName, "tradie");
    const { data: user, error } = await supabase
      .from("users")
      .upsert(
        { auth_id: authId, email, first_name: firstName, last_name: lastName, phone: `04220000${tradies.length + 10}`, role: "tradie", status: "active" },
        { onConflict: "email" }
      )
      .select("id")
      .single();
    if (error) throw error;

    const { data: tradie, error: tradieError } = await supabase
      .from("tradie_profiles")
      .upsert(
        {
          user_id: user.id,
          business_name: businessName,
          abn: `51 824 753 ${100 + tradies.length}`,
          trade_category: category,
          licence_number: `LIC-${1000 + tradies.length}`,
          service_area: suburb,
          emergency_available: tradies.length < 7,
          availability_status: tradies.length < 7 ? "available" : "busy",
          verification_status: tradies.length < 6 ? "approved" : "pending",
          profile_health: 72 + tradies.length,
          rating: 4.4,
          total_reviews: 8 + tradies.length,
          response_rate: 82 + tradies.length
        },
        { onConflict: "user_id" }
      )
      .select("id")
      .single();
    if (tradieError) throw tradieError;

    const { data: wallet, error: walletError } = await supabase
      .from("tradie_credit_wallets")
      .upsert(
        {
          tradie_id: tradie.id,
          balance: 250,
          bonus_balance: 111,
          bonus_monthly_amount: 111,
          bonus_months_total: 6,
          bonus_months_granted: 1,
          bonus_next_renewal_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          bonus_expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 183).toISOString(),
          signup_bonus_granted_at: new Date().toISOString(),
          lifetime_purchased: 250
        },
        { onConflict: "tradie_id" }
      )
      .select("id")
      .single();
    if (walletError) throw walletError;

    await supabase.from("credit_transactions").insert([
      { wallet_id: wallet.id, type: "bonus", amount: 111, reason: "Demo signup bonus: month 1 of 6", created_by: user.id },
      { wallet_id: wallet.id, type: "purchase", amount: 250, reason: "Demo credit top-up", created_by: user.id }
    ]);
    await supabase.from("tradie_subscriptions").upsert({ tradie_id: tradie.id, plan: tradies.length < 3 ? "emergency_pro" : "starter", status: "active" }, { onConflict: "tradie_id" });
    await supabase.from("verification_documents").insert({
      tradie_id: tradie.id,
      type: "licence",
      status: tradies.length < 6 ? "approved" : "pending",
      file_url: "https://example.com/demo-licence.pdf",
      notes: "Demo verification document"
    });

    tradies.push({ ...tradie, userId: user.id, email, firstName, category, suburb });
  }

  return { customers, tradies };
}

async function seedJobs(customers, tradies) {
  for (let index = 0; index < jobTemplates.length; index += 1) {
    const [type, category, title, description, urgency] = jobTemplates[index];
    const customer = customers[index % customers.length];
    const matchingTradie = tradies.find((tradie) => category.toLowerCase().includes(tradie.category.toLowerCase())) ?? tradies[index % tradies.length];
    const assigned = index % 5 === 0 ? matchingTradie.id : null;
    const status = assigned ? "tradie_accepted" : index < 8 ? "received" : index < 14 ? "matching" : "completed";

    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        customer_id: index < 3 ? null : customer.id,
        guest_name: index < 3 ? customer.firstName : null,
        guest_phone: index < 3 ? customer.phone : null,
        guest_email: index < 3 ? customer.email : null,
        type,
        category,
        urgency,
        title,
        description,
        danger_notes: urgency === "emergency" ? "Customer reports urgency but no immediate life danger." : "No immediate danger.",
        utilities_involved: category === "Electrical" ? "Electricity" : category === "Plumbing" ? "Water" : "Not sure",
        address: type === "road" ? null : "12 Demo Street",
        suburb: customer.suburb,
        postcode: "2000",
        state: "NSW",
        road_name: type === "road" ? "Demo Road" : null,
        road_direction: type === "road" ? "westbound" : null,
        landmark: type === "road" ? "near service station" : null,
        preferred_contact_method: "call",
        consent_to_contact: true,
        status,
        assigned_tradie_id: assigned,
        credit_cost: urgency === "emergency" ? 120 : 50,
        estimated_value_min: urgency === "emergency" ? 250 : 120,
        estimated_value_max: urgency === "emergency" ? 650 : 380
      })
      .select("id")
      .single();
    if (error) throw error;

    await supabase.from("job_status_events").insert({
      job_id: job.id,
      status,
      title: status === "received" ? "Job posted" : "Job updated",
      note: "Demo status event",
      created_by: index < 3 ? null : customer.id
    });

    await supabase.from("job_messages").insert({
      job_id: job.id,
      sender_user_id: index < 3 ? null : customer.id,
      sender_label: customer.firstName,
      body: "Please call before arriving. Photos can be added later.",
    });

    if (index >= 14) {
      await supabase.from("reviews").insert({
        job_id: job.id,
        reviewer_id: customer.id,
        reviewee_id: tradies[index % tradies.length].userId,
        rating: 5,
        comment: "Demo review: fast, clear, and professional."
      });
    }
  }
}

async function seedMemberships(customers) {
  for (let index = 0; index < customers.length; index += 1) {
    const plan = index % 2 === 0 ? "complete" : "home";
    await supabase.from("memberships").upsert(
      {
        customer_id: customers[index].id,
        plan,
        price_cents: plan === "complete" ? 4900 : 2900,
        status: index < 3 ? "active" : "pending_activation",
        activation_start: new Date().toISOString(),
        activation_effective_at: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString()
      },
      { onConflict: "customer_id,plan" }
    );
  }
}

const { customers, tradies } = await seedUsers();
await seedMemberships(customers);
await seedJobs(customers, tradies);

console.log("Demo seed complete.");
console.log(`Customers: ${customers.length}`);
console.log(`Tradies: ${tradies.length}`);
console.log(`Password for demo users: ${password}`);
