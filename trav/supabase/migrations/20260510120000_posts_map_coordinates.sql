-- Optional geocoded coordinates for profile map pins (filled after publish/edit via app geocoder).
ALTER TABLE public.posts
  ADD COLUMN map_latitude DOUBLE PRECISION,
  ADD COLUMN map_longitude DOUBLE PRECISION;

COMMENT ON COLUMN public.posts.map_latitude IS 'Geocoded latitude for map pin (first waypoint name or location_display).';
COMMENT ON COLUMN public.posts.map_longitude IS 'Geocoded longitude for map pin.';
