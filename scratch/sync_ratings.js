const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function sync() {
    const { data: ratingsData } = await supabase.from("testimonials").select("rating");
    const totalReviews = ratingsData?.length || 0;
    const avgRating = totalReviews > 0
        ? Number((ratingsData.reduce((sum, row) => sum + Number(row.rating || 0), 0) / totalReviews).toFixed(1))
        : 0;

    console.log(`Total: ${totalReviews}, Avg: ${avgRating}`);

    const { error } = await supabase.from("products").update({
        reviews: totalReviews,
        rating: avgRating
    }).neq("id", 0);

    if (error) {
        console.error("Sync Error:", error);
    } else {
        console.log("Sync Successful");
    }
}
sync();
