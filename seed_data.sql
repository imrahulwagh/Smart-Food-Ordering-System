-- =====================================================================
-- SMART FOOD ORDERING SYSTEM — DATABASE SEED SCRIPT
-- =====================================================================
-- 7 Categories & 5 Items each (35 Delicious Dishes Total with Image URLs)
-- Run this in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- =====================================================================

-- 1. INSERT 7 POPULAR CATEGORIES
INSERT INTO public.categories (id, name, image)
VALUES
    (1, 'Pizza Special', 'pizza'),
    (2, 'Burger', 'burger'),
    (3, 'Biryani', 'biryani'),
    (4, 'Chinese', 'chinese'),
    (5, 'Desserts', 'desserts'),
    (6, 'Chicken Special', 'chicken'),
    (7, 'Beverages & Shakes', 'drinks')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    image = EXCLUDED.image;

-- Set category identity sequence to continue from 8
SELECT setval(pg_get_serial_sequence('public.categories', 'id'), (SELECT MAX(id) FROM public.categories));

-- =====================================================================
-- 2. INSERT 5 FOOD ITEMS FOR EACH OF THE 7 CATEGORIES (35 ITEMS TOTAL)
-- =====================================================================

-- CATEGORY 1: PIZZA SPECIAL (5 Items)
INSERT INTO public.food_items (category_id, name, description, price, image, s_available) VALUES
(1, 'Margherita Classic Pizza', 'Fresh mozzarella, vine-ripened tomatoes, authentic Italian tomato sauce, and fresh aromatic basil leaves.', 299.00, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=80', TRUE),
(1, 'Farmhouse Veggie Supreme', 'Loaded with crisp bell peppers, sweet corn, button mushrooms, black olives, and melted mozzarella cheese.', 349.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80', TRUE),
(1, 'Spicy Paneer Tikka Pizza', 'Tandoori marinated paneer cubes, red onions, capsicum, and fresh coriander on a spicy sauce base.', 379.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80', TRUE),
(1, 'BBQ Chicken Feast Pizza', 'Tender smoky BBQ chicken chunks, caramelized red onions, cheddar blend, and a drizzle of rich barbecue sauce.', 429.00, 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&auto=format&fit=crop&q=80', TRUE),
(1, 'Four Cheese Italian Delight', 'A heavenly blend of creamy Mozzarella, aged Cheddar, Danish Blue, and delicate Parmesan shavings.', 399.00, 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=800&auto=format&fit=crop&q=80', TRUE);

-- CATEGORY 2: BURGER (5 Items)
INSERT INTO public.food_items (category_id, name, description, price, image, s_available) VALUES
(2, 'Classic Crispy Veg Burger', 'Golden spiced vegetable patty topped with crunchy iceberg lettuce, tomato slice, and creamy herb mayonnaise.', 149.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80', TRUE),
(2, 'Double Cheese Melt Burger', 'Double vegetable patty layered with melted American cheddar, caramelized onions, and garlic pepper sauce.', 199.00, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80', TRUE),
(2, 'Crispy Fried Chicken Burger', 'Crispy buttermilk battered chicken fillet, spicy peri-peri coleslaw, and dill pickles in a toasted brioche bun.', 249.00, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=800&auto=format&fit=crop&q=80', TRUE),
(2, 'Fiery Paneer Zinger Burger', 'Crunchy crumbed paneer steak tossed in spicy hot peri-peri seasoning and creamy chipotle sauce.', 219.00, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80', TRUE),
(2, 'Smoky BBQ Bacon Chicken Burger', 'Grilled chicken patty with smoky BBQ sauce, melted Monterey jack, and crispy turkey bacon rashers.', 289.00, 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800&auto=format&fit=crop&q=80', TRUE);

-- CATEGORY 3: BIRYANI (5 Items)
INSERT INTO public.food_items (category_id, name, description, price, image, s_available) VALUES
(3, 'Hyderabadi Chicken Dum Biryani', 'Authentic long-grain basmati rice and tender chicken cuts slow-cooked on dum with saffron, mint, and fried onions.', 349.00, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80', TRUE),
(3, 'Royal Mutton Dum Biryani', 'Succulent baby goat meat infused with freshly ground royal spices, layered with fragrant saffron rice.', 449.00, 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80', TRUE),
(3, 'Paneer Tikka Dum Biryani', 'Charcoal grilled cottage cheese cubes cooked with aromatic basmati rice, caramelized onions, and mint.', 299.00, 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=800&auto=format&fit=crop&q=80', TRUE),
(3, 'Lucknowi Shahi Veg Biryani', 'Fresh garden veggies cooked with whole spices, rose water, and kewra in classical Awadhi dum style.', 279.00, 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&auto=format&fit=crop&q=80', TRUE),
(3, 'Spicy Egg Dum Biryani', 'Boiled fried eggs simmered in spicy biryani gravy and layered with aromatic basmati rice.', 249.00, 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&auto=format&fit=crop&q=80', TRUE);

-- CATEGORY 4: CHINESE (5 Items)
INSERT INTO public.food_items (category_id, name, description, price, image, s_available) VALUES
(4, 'Veg Hakka Noodles', 'Wok-tossed noodles with shredded cabbage, crunchy carrots, capsicum, and light soy seasoning.', 189.00, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80', TRUE),
(4, 'Chilli Chicken Gravy', 'Crispy chicken pieces tossed with diced onions, bell peppers, green chillies, and savory dark soya sauce.', 299.00, 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&auto=format&fit=crop&q=80', TRUE),
(4, 'Veg Manchurian Dry', 'Golden deep-fried mixed vegetable dumplings tossed in garlic, ginger, spring onions, and spicy coriander sauce.', 229.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80', TRUE),
(4, 'Schezwan Egg Fried Rice', 'Aromatic jasmine rice stir-fried with eggs, vegetables, and fiery homemade Schezwan chilli sauce.', 249.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80', TRUE),
(4, 'Crispy Spring Rolls (6 Pcs)', 'Crispy golden rolls filled with shredded seasonal vegetables and glass noodles, served with sweet chilli dip.', 179.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', TRUE);

-- CATEGORY 5: DESSERTS (5 Items)
INSERT INTO public.food_items (category_id, name, description, price, image, s_available) VALUES
(5, 'Chocolate Lava Cake', 'Warm, decadent Belgian dark chocolate cake with a rich molten center that flows on your first bite.', 149.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80', TRUE),
(5, 'New York Style Cheesecake', 'Classic creamy cheesecake on a buttery graham cracker crust, topped with strawberry coulis.', 219.00, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&auto=format&fit=crop&q=80', TRUE),
(5, 'Hot Gulab Jamun with Rabdi', 'Soft golden milk dumplings soaked in cardamom sugar syrup, paired with thick saffron rabdi.', 129.00, 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=800&auto=format&fit=crop&q=80', TRUE),
(5, 'Fudgy Walnut Brownie Sundae', 'Warm chocolate walnut brownie served with vanilla ice cream, hot chocolate fudge, and roasted nuts.', 179.00, 'https://images.unsplash.com/photo-1607920592519-bab4d7db727d?w=800&auto=format&fit=crop&q=80', TRUE),
(5, 'Red Velvet Pastry Slice', 'Velvety crimson sponge cake layered with silky cream cheese frosting and white chocolate curls.', 159.00, 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=800&auto=format&fit=crop&q=80', TRUE);

-- CATEGORY 6: CHICKEN SPECIAL (5 Items)
INSERT INTO public.food_items (category_id, name, description, price, image, s_available) VALUES
(6, 'Butter Chicken Special', 'Tender tandoori chicken simmered in an indulgent tomato butter cream gravy with dried fenugreek.', 389.00, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80', TRUE),
(6, 'Chicken Tikka Masala', 'Smoky boneless chicken chunks cooked in an onion-tomato spiced gravy with capsicum strips.', 369.00, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80', TRUE),
(6, 'Tandoori Murgh (Half)', 'Whole bone-in chicken marinated in spiced yogurt and roasted to perfection in a traditional clay oven.', 329.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80', TRUE),
(6, 'Kadai Chicken', 'Spicy chicken cooked in a traditional cast-iron wok with crushed coriander seeds, capsicum, and whole red chillies.', 359.00, 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80', TRUE),
(6, 'Chicken Afghani Tikka (6 Pcs)', 'Boneless chicken marinated in rich cashew paste, fresh cream, cheese, and mild white pepper.', 339.00, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80', TRUE);

-- CATEGORY 7: BEVERAGES & SHAKES (5 Items)
INSERT INTO public.food_items (category_id, name, description, price, image, s_available) VALUES
(7, 'Oreo Overload Milkshake', 'Thick blended milkshake loaded with crushed crunchy Oreo cookies, dark chocolate sauce, and whipped cream.', 169.00, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=80', TRUE),
(7, 'Classic Cold Coffee with Ice Cream', 'Chilled espresso blended with creamy milk and topped with a scoop of premium vanilla bean ice cream.', 149.00, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80', TRUE),
(7, 'Fresh Mint Mojito', 'Refreshing cooler muddled with fresh mint sprigs, lime wedges, sparkling soda, and crushed ice.', 129.00, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80', TRUE),
(7, 'Alphonso Mango Shake', 'Rich summer shake prepared with real Alphonso mango pulp, condensed milk, and pistachio slivers.', 159.00, 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800&auto=format&fit=crop&q=80', TRUE),
(7, 'Iced Lemon Peach Tea', 'Brewed black tea infused with natural lemon essence, sweet peach syrup, and served over ice.', 119.00, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&auto=format&fit=crop&q=80', TRUE);
