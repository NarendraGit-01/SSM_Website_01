-- SSM Website: Seed Services Table
-- Run this in the Supabase SQL Editor

DELETE FROM public.services;

INSERT INTO public.services (title, cat, img, desc_text) VALUES
('Stainless Steel Main Gate', 'Steel products', 'https://images.unsplash.com/photo-1590069230005-db393739d22b?q=80&w=800&auto=format&fit=crop', 'Premium custom-designed stainless steel entry gates.'),
('Stainless Steel Staircase Railing', 'Steel products', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba3f21?q=80&w=800&auto=format&fit=crop', 'Durable and aesthetic SS railings for modern staircases.'),
('Stainless Steel Balcony Railing', 'Steel products', 'https://images.unsplash.com/photo-1628172901323-5c74fb3ff240?q=80&w=800&auto=format&fit=crop', 'Safe and contemporary SS balcony enclosures.'),
('Stainless Steel Safety Door', 'Steel products', 'https://images.unsplash.com/photo-1517581177682-a085bc7fc0ce?q=80&w=800&auto=format&fit=crop', 'High-security SS doors with elegant aesthetics.'),
('Stainless Steel Spiral Railing', 'Steel products', 'https://images.unsplash.com/photo-1551608249-f0d5defa9ca2?q=80&w=800&auto=format&fit=crop', 'Curved and custom-bent SS spiral staircase handrails.'),
('Stainless Steel Canopies', 'Steel products', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop', 'Weather-resistant SS canopies with glass or polycarbonate.'),
('Iron Main Gate', 'Iron Works', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop', 'Heavy-duty wrought and cast iron entry gates.'),
('Iron Stair Railing', 'Iron Works', 'https://images.unsplash.com/photo-1551608249-f0d5defa9ca2?q=80&w=800&auto=format&fit=crop', 'Ornamental handcrafted iron railings for indoor and outdoor stairs.'),
('Iron Balcony Railing', 'Iron Works', 'https://images.unsplash.com/photo-1628172901323-5c74fb3ff240?q=80&w=800&auto=format&fit=crop', 'Classic cast iron balcony safety grilles.'),
('Iron Safety Door', 'Iron Works', 'https://images.unsplash.com/photo-1517581177682-a085bc7fc0ce?q=80&w=800&auto=format&fit=crop', 'Robust ornamental iron security doors.'),
('Iron Spiral Stair', 'Iron Works', 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?q=80&w=800&auto=format&fit=crop', 'Space-saving elegant cast iron spiral staircases.'),
('UPVC Doors', 'UPVC products', 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?q=80&w=800&auto=format&fit=crop', 'Weather-proof and soundproof UPVC entry and balcony doors.'),
('UPVC Windows', 'UPVC products', 'https://images.unsplash.com/photo-1605276374104-aa237e7ce871?q=80&w=800&auto=format&fit=crop', 'Energy-efficient sliding and casement UPVC windows.'),
('Modular Kitchen', 'Interiors', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800&auto=format&fit=crop', 'Custom designed modern modular kitchens with premium fittings.'),
('Wooden Cupboards', 'Interiors', 'https://images.unsplash.com/photo-1595526051245-4506e0005bd0?q=80&w=800&auto=format&fit=crop', 'Space-optimized custom wardrobes and wooden cupboards.'),
('False Ceiling', 'Interiors', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop', 'Elegant POP and Gypsum false ceiling designs with hidden lighting.'),
('Home Lifts', 'Home lifts', 'https://images.unsplash.com/photo-1588613146197-2fed2e05df5e?q=80&w=800&auto=format&fit=crop', 'Compact, silent, and luxurious home elevator solutions.'),
('Commercial Lifts', 'Home lifts', 'https://images.unsplash.com/photo-1616010515152-dbf1a30f7855?q=80&w=800&auto=format&fit=crop', 'Reliable, high-capacity lifts for commercial establishments.');
