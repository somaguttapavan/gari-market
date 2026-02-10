// Rule-based Agricultural Assistant Logic
// Rule-based Agricultural Assistant Logic - ENHANCED KNOWLEDGE BASE
const AGRI_KNOWLEDGE = [
    // 🟢 BASIC ORGANIC FARMING (Q1–Q10)
    {
        keywords: ['convert', 'chemical', 'conversion'],
        response: "Converting chemical land into organic:\n1. Stop all chemical inputs immediately.\n2. Remove old chemical containers.\n3. Apply heavy organic matter (compost/FYM).\n4. Grow green manure crops.\n5. Recover soil for 1–2 seasons.\n6. Start with low-input crops."
    },
    {
        keywords: ['test soil', 'soil testing', 'carbon'],
        response: "Soil Testing for Organic Farming:\n1. Collect soil from multiple spots.\n2. Mix samples properly.\n3. Dry in shade.\n4. Send to soil lab.\n5. Check pH and organic carbon.\n6. Plan inputs based on report."
    },
    {
        keywords: ['increase organic', 'organic matter', 'tillage'],
        response: "Increasing Soil Organic Matter:\n1. Add compost every season.\n2. Use crop residues as mulch.\n3. Grow green manure.\n4. Avoid burning residues.\n5. Reduce excessive tillage."
    },
    {
        keywords: ['prepare compost', 'farm level', 'dung'],
        response: "Preparing Compost at Farm Level:\n1. Collect cow dung and crop waste.\n2. Arrange in layers.\n3. Maintain moisture.\n4. Turn every 15 days.\n5. Allow 45–60 days.\n6. Use when fully decomposed."
    },
    {
        keywords: ['apply compost', 'sowing', 'topsoil'],
        response: "Applying Compost Correctly:\n1. Apply before sowing.\n2. Spread evenly.\n3. Mix with topsoil.\n4. Irrigate lightly.\n5. Avoid direct root contact."
    },
    {
        keywords: ['biofertilizer', 'mix gently'],
        response: "Preparing Biofertilizer Solution:\n1. Use clean water.\n2. Add recommended biofertilizer.\n3. Mix gently.\n4. Use immediately.\n5. Avoid chemical mixing."
    },
    {
        keywords: ['plan crops', 'rotate', 'rotation'],
        response: "Organic Crop Planning:\n1. Choose seasonal crops.\n2. Rotate crops yearly.\n3. Avoid monocultures.\n4. Mix legumes in rotation.\n5. Observe soil response."
    },
    {
        keywords: ['manage weeds', 'mulch soil', 'hand weed'],
        response: "Organic Weed Management:\n1. Mulch soil.\n2. Hand weed early.\n3. Avoid bare soil.\n4. Use cover crops.\n5. Repeat regularly."
    },
    {
        keywords: ['reduce pest', 'beneficial insects', 'monocropping'],
        response: "Natural Pest Reduction:\n1. Maintain soil health.\n2. Encourage beneficial insects.\n3. Monitor crops daily.\n4. Act early.\n5. Avoid monocropping."
    },
    {
        keywords: ['stabilize', 'how long', 'stable production'],
        response: "Organic Stabilization Timeline:\n- Year 1: Soil recovery.\n- Year 2: Yield improvement.\n- Year 3: Stable production.\n- Future: Consistent results."
    },

    // 🍅 ORGANIC TOMATO (Q11–Q25)
    {
        keywords: ['land for tomato', 'drained soil'],
        response: "Tomato Land Selection:\n1. Choose well-draining soil.\n2. Avoid waterlogged spots.\n3. Ensure full sunlight.\n4. Check soil pH.\n5. Remove old crop residues."
    },
    {
        keywords: ['tomato nursery', 'raised beds', 'tomato seed'],
        response: "Organic Tomato Nursery:\n1. Prepare raised beds.\n2. Mix soil + vermicompost.\n3. Treat seeds.\n4. Sow thinly.\n5. Water gently.\n6. Protect from pests."
    },
    {
        keywords: ['transplant', 'evening', 'spacing'],
        response: "Transplanting Seedlings:\n1. Irrigate nursery first.\n2. Select healthy seedlings.\n3. Transplant in evening.\n4. Maintain spacing.\n5. Water immediately."
    },
    {
        keywords: ['fertilize tomato', 'spray compost tea'],
        response: "Organic Tomato Fertilizing:\n1. Apply compost at planting.\n2. Add vermicompost after 20 days.\n3. Spray compost tea.\n4. Observe and adjust growth."
    },
    {
        keywords: ['water tomato', 'moisture', 'waterlogging'],
        response: "Tomato Watering Guide:\n1. Water after transplanting.\n2. Maintain even moisture.\n3. Avoid waterlogging.\n4. Increase during flowering.\n5. Reduce near harvest."
    },
    {
        keywords: ['tomato pest', 'sticky traps', 'neem oil'],
        response: "Organic Tomato Pest Control:\n1. Monitor leaves.\n2. Install sticky traps.\n3. Spray neem oil.\n4. Remove affected parts.\n5. Repeat weekly."
    },
    {
        keywords: ['tomato disease', 'trichoderma'],
        response: "Preventing Tomato Diseases:\n1. Use healthy seeds.\n2. Maintain spacing.\n3. Avoid overhead watering.\n4. Apply Trichoderma.\n5. Remove infected plants."
    },
    {
        keywords: ['tomato yield', 'pruning'],
        response: "Improving Tomato Yield:\n1. Balanced nutrition.\n2. Proper irrigation.\n3. Sunlight exposure.\n4. Timely pruning.\n5. Stress reduction."
    },
    {
        keywords: ['leaf curl', 'whiteflies'],
        response: "Controlling Leaf Curl:\n1. Control whiteflies.\n2. Spray neem oil.\n3. Use yellow traps.\n4. Remove infected plants.\n5. Maintain hygiene."
    },
    {
        keywords: ['harvest tomato', 'grade', 'color break'],
        response: "Correct Tomato Harvesting:\n1. Harvest at color break stage.\n2. Use clean hands.\n3. Avoid damage.\n4. Store in shade.\n5. Grade properly."
    },
    {
        keywords: ['tomato crack', 'cracking'],
        response: "Why Tomatoes Crack:\n1. Irregular irrigation.\n2. Sudden watering after dry spell.\n3. Maintain consistent moisture.\n4. Use mulch."
    },
    {
        keywords: ['prune tomato'],
        response: "Pruning Tomatoes Organically:\n1. Remove excess suckers/shoots.\n2. Keep main stem.\n3. Remove diseased leaves.\n4. Improve airflow."
    },
    {
        keywords: ['heat stress', 'shade net'],
        response: "Protecting Tomatoes from Heat:\n1. Mulch soil.\n2. Increase watering.\n3. Use shade nets if needed.\n4. Avoid midday irrigation."
    },
    {
        keywords: ['last', 'long', 'productivity drops'],
        response: "Tomato Crop Life:\n1. First harvest in 60-70 days.\n2. Multiple pickings.\n3. Crop lasts 3–4 months.\n4. Remove after productivity drops."
    },
    {
        keywords: ['intercrop', 'compatible'],
        response: "Organic Tomato Intercropping:\n1. Choose compatible crops.\n2. Maintain spacing.\n3. Monitor pests.\n4. Adjust irrigation."
    },

    // 🥔 ORGANIC POTATO (Q26–Q35)
    {
        keywords: ['land for potato', 'ploughing', 'ridges'],
        response: "Potato Land Preparation:\n1. Deep ploughing.\n2. Remove stones.\n3. Apply compost.\n4. Prepare ridges.\n5. Ensure drainage."
    },
    {
        keywords: ['seed potato', 'tubers'],
        response: "Selecting Seed Potatoes:\n1. Choose disease-free tubers.\n2. Medium size preferred.\n3. Avoid cuts.\n4. Treat organically."
    },
    {
        keywords: ['plant potato', 'furrows'],
        response: "Planting Potatoes:\n1. Place tubers in furrows.\n2. Maintain spacing.\n3. Cover lightly.\n4. Irrigate promptly."
    },
    {
        keywords: ['earthing up', 'stem base'],
        response: "Earthing Up Process:\n1. Wait 20 days.\n2. Pull soil to stem base.\n3. Cover exposed tubers.\n4. Repeat once more."
    },
    {
        keywords: ['water potato', 'irrigate potato'],
        response: "Irrigating Potatoes:\n1. Water after planting.\n2. Keep soil moist.\n3. Avoid excess water.\n4. Stop before harvest."
    },
    {
        keywords: ['potato pest'],
        response: "Potato Pest Control:\n1. Field inspection.\n2. Neem sprays.\n3. Crop rotation.\n4. Remove affected plants."
    },
    {
        keywords: ['potato disease'],
        response: "Preventing Potato Diseases:\n1. Use healthy seeds.\n2. Ensure good airflow.\n3. Avoid overcrowding.\n4. Organic sprays."
    },
    {
        keywords: ['ready', 'yellow', 'dig'],
        response: "When to Harvest Potato:\n1. Leaves turn yellow.\n2. Stop irrigation.\n3. Test dig.\n4. Harvest fully."
    },
    {
        keywords: ['store potato'],
        response: "Storing Organic Potatoes:\n1. Dry tubers.\n2. Remove damaged ones.\n3. Store cool.\n4. Avoid sunlight."
    },
    {
        keywords: ['potato every year'],
        response: "Successive Potato Crops:\n- Rotate crops (don't use same land every year).\n- Improve soil quality.\n- Monitor for diseases."
    },

    // 🥕 BEETROOT & ROOT CROPS (Q36–Q50)
    {
        keywords: ['soil for beetroot', 'loosen'],
        response: "Beetroot Soil Prep:\n1. Loosen soil deeply.\n2. Remove stones.\n3. Add compost.\n4. Level the bed."
    },
    {
        keywords: ['sow beetroot', 'shallow'],
        response: "Sowing Beetroot Seeds:\n1. Direct sowing.\n2. Shallow depth.\n3. Proper spacing.\n4. Gentle watering."
    },
    {
        keywords: ['water beetroot'],
        response: "Beetroot Irrigation:\n1. Keep soil moist.\n2. Avoid drying out.\n3. Reduce near harvest."
    },
    {
        keywords: ['fertilize beetroot', 'vermicompost'],
        response: "Organic Beetroot Fertilizer:\n1. Compost at prep.\n2. Vermicompost after thinning.\n3. Avoid excess nitrogen."
    },
    {
        keywords: ['deformed', 'hardness'],
        response: "Why Roots Decform:\n1. Hard soil.\n2. Stones.\n3. Poor drainage.\n4. Inconsistent moisture."
    },
    {
        keywords: ['beetroot pest'],
        response: "Beetroot Pest Control:\n1. Inspect leaves.\n2. Remove affected parts.\n3. Neem oil spray.\n4. Field sanitation."
    },
    {
        keywords: ['beetroot ready', 'harvest beetroot'],
        response: "Beetroot Harvesting:\n1. Check size.\n2. Loosen soil.\n3. Pull gently.\n4. Cut leaves and clean."
    },
    {
        keywords: ['container'],
        response: "Growing in Containers:\n1. Use deep pots.\n2. Loose soil mix.\n3. Regular water.\n4. Sunlight."
    },
    {
        keywords: ['yellow', 'nitrogen'],
        response: "Why Leaves Yellow:\n1. Nitrogen deficiency.\n2. Overwatering.\n3. Poor drainage."
    },
    {
        keywords: ['store beetroot'],
        response: "Storing Beetroot:\n1. Remove leaves.\n2. Clean soil.\n3. Store cool and dry."
    },
    {
        keywords: ['intercrop'],
        response: "Intercropping Beetroot:\n1. Choose shallow-root crops.\n2. Maintain spacing.\n3. Monitor nutrients."
    },
    {
        keywords: ['root size'],
        response: "Improving Root Size:\n1. Loose soil.\n2. Balanced nutrition.\n3. Even watering."
    },
    {
        keywords: ['bitterness', 'heat stress'],
        response: "Reducing Bitterness:\n1. Avoid heat stress.\n2. Regular irrigation.\n3. Harvest on time."
    },
    {
        keywords: ['sustainable', 'profit'],
        response: "Organic Sustainability:\n- Soil improves yearly.\n- Costs reduce.\n- Yield stabilizes.\n- Long-term profit increases."
    },

    // Standard greetings & general info
    {
        keywords: ['hello', 'hi', 'namaste', 'hey'],
        response: "Namaste! I am your AgriGrowth Assistant, now trained with 50+ new organic farming guides (Tomato, Potato, Beetroot, etc.). How can I help you today?"
    },
    {
        keywords: ['price', 'market', 'cost', 'sale'],
        response: "Market Info: Check our 'Live Market Price' section for real-time rates. Current trends show high demand for organic vegetables like Tomatoes and Potatoes."
    }
];

export const getLocalResponse = (input) => {
    const lowerInput = input.toLowerCase();

    // Find matching knowledge entry
    for (const entry of AGRI_KNOWLEDGE) {
        if (entry.keywords.some(keyword => lowerInput.includes(keyword))) {
            return entry.response;
        }
    }

    return "I'm not quite sure about that specific topic. Try asking about crops (like Tomato), pests, soil health, or market prices! You can also check our 'Cultivation Guides' for more details.";
};
