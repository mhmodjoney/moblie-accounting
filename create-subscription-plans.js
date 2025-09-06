const db = require("./app/models");
const SubscriptionPlan = db.subscription_plan;

const subscriptionPlans = [
  {
    plan_key: "free_trial",
    name: "Free Trial",
    price: 0.00,
    currency: "USD",
    duration_days: 7,
    description: "7-day free trial",
    features: ["Basic access", "Limited features"],
    max_users: 1,
    is_active: true,
    created_by: "system"
  },
  {
    plan_key: "1_month",
    name: "Monthly Plan",
    price: 9.99,
    currency: "USD",
    duration_days: 30,
    description: "1 month subscription",
    features: ["Full access", "All features", "Email support"],
    max_users: 1,
    is_active: true,
    created_by: "system"
  },
  {
    plan_key: "3_month",
    name: "Quarterly Plan",
    price: 24.99,
    currency: "USD",
    duration_days: 90,
    description: "3 months subscription",
    features: ["Full access", "All features", "Priority support"],
    max_users: 1,
    is_active: true,
    created_by: "system"
  },
  {
    plan_key: "6_month",
    name: "Semi-Annual Plan",
    price: 44.99,
    currency: "USD",
    duration_days: 180,
    description: "6 months subscription",
    features: ["Full access", "All features", "Priority support", "10% discount"],
    max_users: 1,
    is_active: true,
    created_by: "system"
  },
  {
    plan_key: "1_year",
    name: "Annual Plan",
    price: 79.99,
    currency: "USD",
    duration_days: 365,
    description: "1 year subscription",
    features: ["Full access", "All features", "Priority support", "20% discount"],
    max_users: 1,
    is_active: true,
    created_by: "system"
  },
  {
    plan_key: "2_year",
    name: "Biennial Plan",
    price: 139.99,
    currency: "USD",
    duration_days: 730,
    description: "2 years subscription",
    features: ["Full access", "All features", "Priority support", "30% discount"],
    max_users: 1,
    is_active: true,
    created_by: "system"
  },
  {
    plan_key: "lifetime",
    name: "Lifetime Access",
    price: 299.99,
    currency: "USD",
    duration_days: 36500,
    description: "Lifetime subscription",
    features: ["Full access", "All features", "Lifetime updates", "Premium support"],
    max_users: 5,
    is_active: true,
    created_by: "system"
  }
];

async function createSubscriptionPlans() {
  try {
    console.log("🌱 Creating subscription plans...");
    
    let created = 0;
    let skipped = 0;
    
    for (const plan of subscriptionPlans) {
      const existingPlan = await SubscriptionPlan.findOne({
        where: { plan_key: plan.plan_key }
      });
      
      if (existingPlan) {
        console.log(`⏭️  Skipped: ${plan.name} (already exists)`);
        skipped++;
      } else {
        await SubscriptionPlan.create(plan);
        console.log(`✅ Created: ${plan.name} - $${plan.price} (${plan.duration_days} days)`);
        created++;
      }
    }
    
    console.log("\n🎉 Summary:");
    console.log(`✅ Created: ${created} plans`);
    console.log(`⏭️  Skipped: ${skipped} plans`);
    console.log(`📊 Total: ${created + skipped} plans`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating subscription plans:", error);
    process.exit(1);
  }
}

createSubscriptionPlans();
