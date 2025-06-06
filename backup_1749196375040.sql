--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: update_nearby_places(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_nearby_places() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- X¢a c c b?n ghi cu
    DELETE FROM nearby_places WHERE place_id = NEW.id OR nearby_place_id = NEW.id;
    
    -- Thˆm c c d?a di?m g?n d¢ (trong ph?m vi 2km)
    INSERT INTO nearby_places (place_id, nearby_place_id, distance_km)
    SELECT NEW.id, p.id, ST_Distance(
        ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography
    ) / 1000
    FROM places p
    WHERE p.id != NEW.id
    AND ST_Distance(
        ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography
    ) / 1000 <= 2;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_nearby_places() OWNER TO postgres;

--
-- Name: update_place_rating(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_place_rating() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE places
  SET rating = (
    SELECT AVG(rating)::DECIMAL(3,1)
    FROM reviews
    WHERE place_id = NEW.place_id
  )
  WHERE id = NEW.place_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_place_rating() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    icon character varying(50),
    description text
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: cities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cities (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    country character varying(100) NOT NULL,
    description text,
    image_url text,
    latitude numeric(10,7),
    longitude numeric(10,7)
);


ALTER TABLE public.cities OWNER TO postgres;

--
-- Name: cities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cities_id_seq OWNER TO postgres;

--
-- Name: cities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cities_id_seq OWNED BY public.cities.id;


--
-- Name: itinerary_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.itinerary_items (
    id integer NOT NULL,
    trip_day_id integer,
    place_id integer,
    start_time time without time zone,
    end_time time without time zone,
    duration_minutes integer,
    notes text,
    order_index integer NOT NULL,
    transportation_type character varying(50),
    transportation_details text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.itinerary_items OWNER TO postgres;

--
-- Name: itinerary_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.itinerary_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.itinerary_items_id_seq OWNER TO postgres;

--
-- Name: itinerary_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.itinerary_items_id_seq OWNED BY public.itinerary_items.id;


--
-- Name: nearby_places; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nearby_places (
    place_id integer NOT NULL,
    nearby_place_id integer NOT NULL,
    distance_km numeric(10,2) NOT NULL,
    CONSTRAINT nearby_places_check CHECK ((place_id <> nearby_place_id))
);


ALTER TABLE public.nearby_places OWNER TO postgres;

--
-- Name: place_photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.place_photos (
    id integer NOT NULL,
    place_id integer,
    user_id integer,
    url text NOT NULL,
    caption text,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.place_photos OWNER TO postgres;

--
-- Name: place_photos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.place_photos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.place_photos_id_seq OWNER TO postgres;

--
-- Name: place_photos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.place_photos_id_seq OWNED BY public.place_photos.id;


--
-- Name: places; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.places (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    category_id integer,
    city_id integer,
    address text,
    description text,
    latitude numeric(10,7) NOT NULL,
    longitude numeric(10,7) NOT NULL,
    image_url text,
    opening_hours text,
    contact_info text,
    website text,
    avg_duration_minutes integer,
    price_level character varying(10),
    rating numeric(3,1),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.places OWNER TO postgres;

--
-- Name: places_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.places_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.places_id_seq OWNER TO postgres;

--
-- Name: places_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.places_id_seq OWNED BY public.places.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    user_id integer,
    place_id integer,
    rating integer NOT NULL,
    comment text,
    visit_date date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: saved_places; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saved_places (
    id integer NOT NULL,
    user_id integer,
    place_id integer,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.saved_places OWNER TO postgres;

--
-- Name: saved_places_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.saved_places_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saved_places_id_seq OWNER TO postgres;

--
-- Name: saved_places_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.saved_places_id_seq OWNED BY public.saved_places.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: transportation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transportation (
    id integer NOT NULL,
    from_place_id integer,
    to_place_id integer,
    mode character varying(50) NOT NULL,
    duration_minutes integer,
    distance_km numeric(10,2),
    estimated_cost numeric(10,2)
);


ALTER TABLE public.transportation OWNER TO postgres;

--
-- Name: transportation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transportation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transportation_id_seq OWNER TO postgres;

--
-- Name: transportation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transportation_id_seq OWNED BY public.transportation.id;


--
-- Name: trip_collaborators; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_collaborators (
    trip_id integer NOT NULL,
    user_id integer NOT NULL,
    permission_level character varying(20) DEFAULT 'view'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT trip_collaborators_permission_level_check CHECK (((permission_level)::text = ANY ((ARRAY['view'::character varying, 'edit'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.trip_collaborators OWNER TO postgres;

--
-- Name: trip_days; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_days (
    id integer NOT NULL,
    trip_id integer,
    day_number integer NOT NULL,
    date date NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.trip_days OWNER TO postgres;

--
-- Name: trip_days_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trip_days_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trip_days_id_seq OWNER TO postgres;

--
-- Name: trip_days_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trip_days_id_seq OWNED BY public.trip_days.id;


--
-- Name: trips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trips (
    id integer NOT NULL,
    user_id integer,
    name character varying(150) NOT NULL,
    destination character varying(100) NOT NULL,
    city_id integer,
    start_date date NOT NULL,
    end_date date NOT NULL,
    description text,
    cover_image_url text,
    status character varying(20) DEFAULT 'draft'::character varying,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK ((end_date >= start_date)),
    CONSTRAINT trips_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'planned'::character varying, 'completed'::character varying])::text[])))
);


ALTER TABLE public.trips OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(100),
    avatar_url text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: trip_details; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.trip_details AS
 SELECT t.id AS trip_id,
    t.name AS trip_name,
    t.destination,
    t.start_date,
    t.end_date,
    t.status,
    u.id AS user_id,
    u.username,
    td.id AS day_id,
    td.day_number,
    td.date AS day_date,
    ii.id AS item_id,
    ii.order_index,
    ii.start_time,
    ii.end_time,
    ii.duration_minutes,
    p.id AS place_id,
    p.name AS place_name,
    p.latitude,
    p.longitude,
    p.image_url,
    c.name AS category_name,
    c.icon AS category_icon
   FROM (((((public.trips t
     JOIN public.users u ON ((t.user_id = u.id)))
     JOIN public.trip_days td ON ((t.id = td.trip_id)))
     LEFT JOIN public.itinerary_items ii ON ((td.id = ii.trip_day_id)))
     LEFT JOIN public.places p ON ((ii.place_id = p.id)))
     LEFT JOIN public.categories c ON ((p.category_id = c.id)))
  ORDER BY t.id, td.day_number, ii.order_index;


ALTER VIEW public.trip_details OWNER TO postgres;

--
-- Name: trip_expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_expenses (
    id integer NOT NULL,
    trip_id integer,
    category character varying(50) NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'VND'::character varying,
    description text,
    date date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.trip_expenses OWNER TO postgres;

--
-- Name: trip_expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trip_expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trip_expenses_id_seq OWNER TO postgres;

--
-- Name: trip_expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trip_expenses_id_seq OWNED BY public.trip_expenses.id;


--
-- Name: trip_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trip_tags (
    trip_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.trip_tags OWNER TO postgres;

--
-- Name: trips_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trips_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trips_id_seq OWNER TO postgres;

--
-- Name: trips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trips_id_seq OWNED BY public.trips.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: weather_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weather_data (
    id integer NOT NULL,
    city_id integer,
    date date NOT NULL,
    temperature_high numeric(5,2),
    temperature_low numeric(5,2),
    condition character varying(50),
    precipitation_chance numeric(5,2),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.weather_data OWNER TO postgres;

--
-- Name: weather_data_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.weather_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.weather_data_id_seq OWNER TO postgres;

--
-- Name: weather_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.weather_data_id_seq OWNED BY public.weather_data.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: cities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities ALTER COLUMN id SET DEFAULT nextval('public.cities_id_seq'::regclass);


--
-- Name: itinerary_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_items ALTER COLUMN id SET DEFAULT nextval('public.itinerary_items_id_seq'::regclass);


--
-- Name: place_photos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_photos ALTER COLUMN id SET DEFAULT nextval('public.place_photos_id_seq'::regclass);


--
-- Name: places id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.places ALTER COLUMN id SET DEFAULT nextval('public.places_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: saved_places id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_places ALTER COLUMN id SET DEFAULT nextval('public.saved_places_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: transportation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transportation ALTER COLUMN id SET DEFAULT nextval('public.transportation_id_seq'::regclass);


--
-- Name: trip_days id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_days ALTER COLUMN id SET DEFAULT nextval('public.trip_days_id_seq'::regclass);


--
-- Name: trip_expenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_expenses ALTER COLUMN id SET DEFAULT nextval('public.trip_expenses_id_seq'::regclass);


--
-- Name: trips id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips ALTER COLUMN id SET DEFAULT nextval('public.trips_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: weather_data id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weather_data ALTER COLUMN id SET DEFAULT nextval('public.weather_data_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, icon, description) FROM stdin;
1	restaurant	utensils	Nh… h…ng v… qu n an
2	cafe	coffee	Qu n c… phˆ
3	hotel	hotel	Kh ch s?n v… noi luu tr£
4	tourist_attraction	landmark	D?a di?m tham quan du l?ch
5	shopping	shopping-bag	Trung tƒm mua s?m v… ch?
6	museum	building	B?o t…ng v… tri?n lam
7	beach	umbrella-beach	Bai bi?n
8	nature	tree	C“ng viˆn v… thiˆn nhiˆn
9	entertainment	music	Gi?i tr¡ v… vui choi
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cities (id, name, country, description, image_url, latitude, longitude) FROM stdin;
13	Bà Rịa - Vũng Tàu	Việt Nam	Thành phố biển nổi tiếng	/images/vung-tau.jpg	10.4094000	107.1364000
1	Hà Nội	Việt Nam	Hà Nội nghìn năm văn vở	/images/ha-noi.jpg	21.0278000	105.8342000
2	Thành phố Hồ Chí Minh	Việt Nam	Đẹp	/images/sai-gon.jpg	10.7800000	106.6500000
17	Bến Tre	Việt Nam	Xứ dừa	/images/ben-tre.jpg	10.2433000	106.3751000
3	Bình Phước	Việt Nam	Khá đẹp	/images/123.jpg	11.7440960	106.8907600
4	Bắc Ninh	Việt Nam	Kinh Bắc	/images/1256.jpg	21.1760000	106.0660000
31	Hà Tĩnh	Việt Nam	Hà Tĩnh là một tỉnh thuộc miền Trung Việt Nam, nổi tiếng với cảnh quan thiên nhiên đa dạng, lịch sử hào hùng và nền văn hóa độc đáo. Tỉnh có bờ biển dài, các dãy núi trùng điệp, sông suối uốn lượn và những cánh đồng lúa bạt ngàn. Hà Tĩnh còn có nhiều di tích lịch sử, văn hóa như đền, chùa, và làng cổ.	/images/ha-tinh.jpg	18.3559000	105.8877000
9	Hải Phòng	Việt Nam	Thành phố cảng lớn nhất miền Bắc	/images/hai-phong.jpg	20.8449000	106.6881000
10	Cần Thơ	Việt Nam	Thủ phủ miền Tây Nam Bộ	/images/can-tho.jpg	10.0452000	105.7469000
11	Hải Dương	Việt Nam	Quê hương bánh đậu xanh	/images/hai-duong.jpg	20.9373000	106.3339000
12	An Giang	Việt Nam	Miền đất Phật	/images/an-giang.jpg	10.5215000	105.1259000
14	Bắc Giang	Việt Nam	Vùng đất vải thiều	/images/bac-giang.jpg	21.2731000	106.1946000
15	Bắc Kạn	Việt Nam	Vùng núi phía Bắc	/images/bac-kan.jpg	22.1470000	105.8348000
16	Bạc Liêu	Việt Nam	Vùng đất cù lao	/images/bac-lieu.jpg	9.2941000	105.7215000
18	Bình Định	Việt Nam	Võ cổ truyền	/images/binh-dinh.jpg	13.7765000	109.2216000
19	Bình Dương	Việt Nam	Thành phố công nghiệp	/images/binh-duong.jpg	11.3254000	106.4770000
20	Bình Thuận	Việt Nam	Xứ sở cát trắng	/images/binh-thuan.jpg	11.0904000	108.0721000
21	Cà Mau	Việt Nam	Mũi cực Nam của Tổ quốc	/images/ca-mau.jpg	9.1768000	105.1524000
22	Cao Bằng	Việt Nam	Thác Bản Giốc hùng vĩ	/images/cao-bang.jpg	22.6663000	106.2520000
23	Đắk Lắk	Việt Nam	Tây Nguyên hùng vĩ	/images/dak-lak.jpg	12.7100000	108.2378000
24	Đắk Nông	Việt Nam	Vùng đất đỏ bazan	/images/dak-nong.jpg	12.2646000	107.6098000
25	Điện Biên	Việt Nam	Điện Biên Phủ lịch sử	/images/dien-bien.jpg	21.3891000	103.0199000
26	Đồng Nai	Việt Nam	Vùng đất công nghiệp	/images/dong-nai.jpg	10.9571000	107.1439000
27	Đồng Tháp	Việt Nam	Vườn quốc gia Tràm Chim	/images/dong-thap.jpg	10.4938000	105.6881000
28	Gia Lai	Việt Nam	Cao nguyên xanh	/images/gia-lai.jpg	13.8078000	108.1097000
29	Hà Giang	Việt Nam	Cao nguyên đá Đồng Văn	/images/ha-giang.jpg	22.8023000	104.9784000
30	Hà Nam	Việt Nam	Phủ Lý cổ kính	/images/ha-nam.jpg	20.5835000	105.9230000
33	Hậu Giang	Việt Nam	Vùng đất phù sa	/images/hau-giang.jpg	9.7574000	105.6412000
34	Hòa Bình	Việt Nam	Núi rừng hùng vĩ	/images/hoa-binh.jpg	20.6861000	105.3388000
35	Hưng Yên	Việt Nam	Quê hương longan Hưng Yên	/images/hung-yen.jpg	20.6464000	106.0511000
36	Khánh Hòa	Việt Nam	Nha Trang biển xanh	/images/khanh-hoa.jpg	12.2388000	109.0967000
37	Kiên Giang	Việt Nam	Phú Quốc đảo ngọc	/images/kien-giang.jpg	10.0125000	105.0817000
38	Kon Tum	Việt Nam	Nhà rông cổ truyền	/images/kon-tum.jpg	14.3497000	107.9739000
39	Lai Châu	Việt Nam	Đỉnh Fansipan hùng vĩ	/images/lai-chau.jpg	22.3864000	103.4707000
40	Lâm Đồng	Việt Nam	Đà Lạt thành phố ngàn hoa	/images/lam-dong.jpg	11.5753000	108.1429000
41	Lạng Sơn	Việt Nam	Cửa khẩu Đồng Đăng	/images/lang-son.jpg	21.8537000	106.7614000
42	Lào Cai	Việt Nam	Sa Pa mờ sương	/images/lao-cai.jpg	22.3380000	104.1487000
43	Long An	Việt Nam	Cửa ngõ phía Tây Nam	/images/long-an.jpg	10.6958000	106.2431000
44	Nam Định	Việt Nam	Quê hương áo dài	/images/nam-dinh.jpg	20.4388000	106.1621000
45	Nghệ An	Việt Nam	Quê hương Bác Hồ	/images/nghe-an.jpg	19.2342000	104.9200000
46	Ninh Thuận	Việt Nam	Tháp Chăm Po Klong Garai	/images/ninh-thuan.jpg	11.6739000	108.8629000
47	Phú Thọ	Việt Nam	Đất tổ Hùng Vương	/images/phu-tho.jpg	21.4208000	105.2045000
48	Phú Yên	Việt Nam	Gành Đá Đĩa kỳ thú	/images/phu-yen.jpg	13.0881000	109.0928000
49	Quảng Bình	Việt Nam	Động Phong Nha - Kẻ Bàng	/images/quang-binh.jpg	17.6102000	106.3487000
50	Quảng Nam	Việt Nam	Hội An phố cổ	/images/quang-nam.jpg	15.5393000	108.0190000
51	Quảng Ngãi	Việt Nam	Đảo Lý Sơn	/images/quang-ngai.jpg	15.1214000	108.8044000
52	Quảng Ninh	Việt Nam	Vịnh Hạ Long kỳ quan	/images/quang-ninh.jpg	21.0064000	107.2925000
53	Quảng Trị	Việt Nam	Thành cổ Quảng Trị	/images/quang-tri.jpg	16.7403000	107.1856000
54	Sóc Trăng	Việt Nam	Chùa Dơi nổi tiếng	/images/soc-trang.jpg	9.6003000	105.9739000
55	Sơn La	Việt Nam	Mộc Châu cao nguyên xanh	/images/son-la.jpg	21.3256000	103.9188000
56	Tây Ninh	Việt Nam	Núi Bà Đen thiêng liêng	/images/tay-ninh.jpg	11.3351000	106.1107000
57	Thái Bình	Việt Nam	Đồng bằng châu thổ	/images/thai-binh.jpg	20.4464000	106.3369000
58	Thái Nguyên	Việt Nam	ATK Thái Nguyên	/images/thai-nguyen.jpg	21.5944000	105.8480000
59	Thanh Hóa	Việt Nam	Sầm Sơn biển đẹp	/images/thanh-hoa.jpg	19.8000000	105.7851000
60	Thừa Thiên Huế	Việt Nam	Cố đô Huế	/images/thua-thien-hue.jpg	16.4637000	107.5909000
61	Tiền Giang	Việt Nam	Mỹ Tho sông nước	/images/tien-giang.jpg	10.3596000	106.3455000
62	Trà Vinh	Việt Nam	Vùng đất Khmer	/images/tra-vinh.jpg	9.9477000	106.3256000
63	Tuyên Quang	Việt Nam	ATK Tân Trào	/images/tuyen-quang.jpg	21.7767000	105.2280000
64	Vĩnh Long	Việt Nam	Cù lao An Bình	/images/vinh-long.jpg	10.2397000	105.9571000
5	Đà Nẵng	Việt Nam	Thành phố đáng sống nhất Việt Nam	/images/da-nang.jpg	16.0410000	108.1780000
6	Ninh Bình	Việt Nam	Cố đô Hoa Lư	/images/ninh-binh.jpg	20.2506000	105.9745000
7	Huế	Việt Nam	Cố đô Huế	/images/hue.jpg	16.4637000	107.5909000
8	Thanh Xuân	Việt Nam	Quận trung tâm Hà Nội	/images/thanh-xuan.jpg	21.0000000	105.8000000
65	Vĩnh Phúc	Việt Nam	Tam Đảo mây mờ	/images/vinh-phuc.jpg	21.3608000	105.6052000
66	Yên Bái	Việt Nam	Ruộng bậc thang Mù Cang Chải	/images/yen-bai.jpg	21.7229000	104.9113000
\.


--
-- Data for Name: itinerary_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.itinerary_items (id, trip_day_id, place_id, start_time, end_time, duration_minutes, notes, order_index, transportation_type, transportation_details, created_at, updated_at) FROM stdin;
16	29	15	13:25:00	13:25:00	60	Thưởng thức bánh mì nổi tiếng Sài Gòn với nhiều loại nhân hấp dẫn.	0	\N	\N	2025-05-27 17:21:52.264+07	2025-05-27 17:21:52.264+07
17	29	16	13:25:00	13:25:00	120	Tìm hiểu lịch sử Việt Nam tại Dinh Độc Lập, nơi chứng kiến nhiều sự kiện quan trọng.	1	\N	\N	2025-05-27 17:21:52.269+07	2025-05-27 17:21:52.269+07
18	29	17	13:25:00	13:25:00	90	Chiêm ngưỡng kiến trúc Pháp cổ điển của Nhà thờ Đức Bà Sài Gòn.	2	\N	\N	2025-05-27 17:21:52.271+07	2025-05-27 17:21:52.271+07
19	29	18	13:25:00	13:25:00	60	Thưởng thức món bún chả đặc trưng của miền Bắc tại Sài Gòn.	3	\N	\N	2025-05-27 17:21:52.274+07	2025-05-27 17:21:52.274+07
20	29	19	13:25:00	13:25:00	60	Tham quan kiến trúc độc đáo của Bưu điện Trung tâm Sài Gòn và mua quà lưu niệm.	4	\N	\N	2025-05-27 17:21:52.277+07	2025-05-27 17:21:52.277+07
21	29	20	13:25:00	13:25:00	90	Thưởng thức cà phê đặc sản trong không gian yên tĩnh và hiện đại.	5	\N	\N	2025-05-27 17:21:52.28+07	2025-05-27 17:21:52.28+07
22	29	21	13:25:00	13:25:00	90	Thưởng thức các món ăn truyền thống Việt Nam trong không gian ấm cúng.	6	\N	\N	2025-05-27 17:21:52.283+07	2025-05-27 17:21:52.283+07
23	29	22	13:25:00	13:25:00	60	Đi dạo và ngắm cảnh đường phố Nguyễn Huệ về đêm.	7	\N	\N	2025-05-27 17:21:52.286+07	2025-05-27 17:21:52.286+07
24	30	23	13:25:00	13:25:00	60	Thưởng thức món hủ tiếu Nam Vang nổi tiếng tại Chợ Lớn.	0	\N	\N	2025-05-27 17:21:52.289+07	2025-05-27 17:21:52.289+07
25	30	24	13:25:00	13:25:00	120	Khám phá khu chợ lớn nhất Sài Gòn và mua sắm các loại hàng hóa.	1	\N	\N	2025-05-27 17:21:52.291+07	2025-05-27 17:21:52.291+07
26	30	25	13:25:00	13:25:00	90	Tham quan ngôi chùa cổ kính và linh thiêng của người Hoa.	2	\N	\N	2025-05-27 17:21:52.294+07	2025-05-27 17:21:52.294+07
27	30	26	13:25:00	13:25:00	60	Thưởng thức món sủi cảo và dimsum đặc trưng của người Hoa.	3	\N	\N	2025-05-27 17:21:52.296+07	2025-05-27 17:21:52.296+07
28	30	27	13:25:00	13:25:00	120	Thưởng thức các món ăn đường phố đặc trưng của Chợ Lớn như phá lấu, há cảo, xíu mại.	4	\N	\N	2025-05-27 17:21:52.299+07	2025-05-27 17:21:52.299+07
29	30	28	13:25:00	13:25:00	60	Thưởng thức trà sữa Gong Cha nổi tiếng.	5	\N	\N	2025-05-27 17:21:52.301+07	2025-05-27 17:21:52.301+07
30	30	29	13:25:00	13:25:00	90	Thưởng thức món lẩu dê nổi tiếng của Sài Gòn.	6	\N	\N	2025-05-27 17:21:52.304+07	2025-05-27 17:21:52.304+07
31	30	30	13:25:00	13:25:00	90	Thưởng thức các loại bia thủ công độc đáo của Việt Nam.	7	\N	\N	2025-05-27 17:21:52.307+07	2025-05-27 17:21:52.307+07
32	31	31	13:25:00	13:25:00	60	Thưởng thức món cơm tấm sườn bì chả nổi tiếng của Sài Gòn.	0	\N	\N	2025-05-27 17:21:52.311+07	2025-05-27 17:21:52.311+07
33	31	32	13:25:00	13:25:00	120	Tìm hiểu về những đau thương và mất mát của chiến tranh Việt Nam.	1	\N	\N	2025-05-27 17:21:52.314+07	2025-05-27 17:21:52.314+07
34	31	33	13:25:00	13:25:00	90	Chiêm ngưỡng các tác phẩm nghệ thuật đặc sắc của Việt Nam.	2	\N	\N	2025-05-27 17:21:52.316+07	2025-05-27 17:21:52.316+07
35	31	34	13:25:00	13:25:00	60	Thưởng thức món bún bò Huế đậm đà hương vị.	3	\N	\N	2025-05-27 17:21:52.319+07	2025-05-27 17:21:52.319+07
36	31	35	13:25:00	13:25:00	120	Mua sắm các sản phẩm thời trang, mỹ phẩm và đồ gia dụng cao cấp.	4	\N	\N	2025-05-27 17:21:52.321+07	2025-05-27 17:21:52.321+07
37	31	36	13:25:00	13:25:00	60	Thưởng thức các loại sinh tố trái cây tươi ngon.	5	\N	\N	2025-05-27 17:21:52.324+07	2025-05-27 17:21:52.324+07
38	31	37	13:25:00	13:25:00	90	Thưởng thức các món ăn BBQ kiểu Mỹ.	6	\N	\N	2025-05-27 17:21:52.328+07	2025-05-27 17:21:52.328+07
39	32	38	13:25:00	13:25:00	60	Thưởng thức các món ăn sáng địa phương như bún riêu, bánh mì, hoặc phở.	0	\N	\N	2025-05-28 09:28:37.569+07	2025-05-28 09:28:37.569+07
40	32	39	13:25:00	13:25:00	90	Tìm hiểu về lịch sử chiến thắng Đồng Xoài và chiêm ngưỡng tượng đài.	1	\N	\N	2025-05-28 09:28:37.576+07	2025-05-28 09:28:37.576+07
41	32	40	13:25:00	13:25:00	90	Thưởng thức các món ăn đặc sản Bình Phước như cơm niêu, gà nướng.	2	\N	\N	2025-05-28 09:28:37.581+07	2025-05-28 09:28:37.581+07
42	32	41	13:25:00	13:25:00	120	Tìm hiểu về lịch sử, văn hóa và con người Bình Phước.	3	\N	\N	2025-05-28 09:28:37.587+07	2025-05-28 09:28:37.587+07
43	32	42	13:25:00	13:25:00	60	Thưởng thức cafe và thư giãn.	4	\N	\N	2025-05-28 09:28:37.596+07	2025-05-28 09:28:37.596+07
44	32	43	13:25:00	13:25:00	90	Thưởng thức các món nướng.	5	\N	\N	2025-05-28 09:28:37.605+07	2025-05-28 09:28:37.605+07
45	33	44	13:25:00	13:25:00	60	Ăn sáng đơn giản trước khi vào Vườn Quốc Gia.	0	\N	\N	2025-05-28 09:28:37.615+07	2025-05-28 09:28:37.615+07
46	33	45	13:25:00	13:25:00	240	Khám phá hệ sinh thái đa dạng của Vườn Quốc Gia, trekking, tìm hiểu về động thực vật.	1	\N	\N	2025-05-28 09:28:37.623+07	2025-05-28 09:28:37.623+07
47	33	46	13:25:00	13:25:00	60	Ăn trưa dã ngoại trong Vườn Quốc Gia.	2	\N	\N	2025-05-28 09:28:37.631+07	2025-05-28 09:28:37.631+07
48	33	47	13:25:00	13:25:00	120	Di chuyển từ Vườn Quốc Gia Bù Gia Mập về lại Đồng Xoài.	3	\N	\N	2025-05-28 09:28:37.639+07	2025-05-28 09:28:37.639+07
49	33	48	13:25:00	13:25:00	90	Thưởng thức các món ăn địa phương.	4	\N	\N	2025-05-28 09:28:37.646+07	2025-05-28 09:28:37.646+07
50	34	49	13:25:00	13:25:00	60	Ăn sáng nhẹ nhàng.	0	\N	\N	2025-05-28 09:28:37.656+07	2025-05-28 09:28:37.656+07
51	34	50	13:25:00	13:25:00	120	Mua các đặc sản địa phương như hạt điều, tiêu, các loại bánh kẹo.	1	\N	\N	2025-05-28 09:28:37.664+07	2025-05-28 09:28:37.664+07
52	34	51	13:25:00	13:25:00	90	Ăn trưa trước khi di chuyển.	2	\N	\N	2025-05-28 09:28:37.674+07	2025-05-28 09:28:37.674+07
53	34	52	13:25:00	13:25:00	60	Di chuyển về lại.	3	\N	\N	2025-05-28 09:28:37.679+07	2025-05-28 09:28:37.679+07
54	37	53	13:25:00	13:25:00	60	Nhận phòng và nghỉ ngơi sau chuyến đi.	0	\N	\N	2025-05-29 18:50:44.086+07	2025-05-29 18:50:44.086+07
55	37	54	13:25:00	13:25:00	120	Khám phá văn hóa và lịch sử của các dân tộc thiểu số ở Việt Nam.	1	\N	\N	2025-05-29 18:50:44.092+07	2025-05-29 18:50:44.092+07
56	37	55	13:25:00	13:25:00	90	Thưởng thức món lẩu đặc trưng của Thái Nguyên.	2	\N	\N	2025-05-29 18:50:44.096+07	2025-05-29 18:50:44.096+07
57	37	56	13:25:00	13:25:00	180	Đi thuyền trên hồ, tham quan các đảo và ngắm cảnh.	3	\N	\N	2025-05-29 18:50:44.1+07	2025-05-29 18:50:44.1+07
58	37	57	13:25:00	13:25:00	90	Thư giãn sau một ngày dài tham quan.	4	\N	\N	2025-05-29 18:50:44.104+07	2025-05-29 18:50:44.104+07
59	37	58	13:25:00	13:25:00	120	Ăn tối và hát karaoke.	5	\N	\N	2025-05-29 18:50:44.108+07	2025-05-29 18:50:44.108+07
60	38	59	13:25:00	13:25:00	60	Ăn sáng buffet tại khách sạn.	0	\N	\N	2025-05-29 18:50:44.113+07	2025-05-29 18:50:44.113+07
61	38	60	13:25:00	13:25:00	180	Tham quan đồi chè, tìm hiểu quy trình sản xuất chè và thưởng thức chè Tân Cương.	1	\N	\N	2025-05-29 18:50:44.117+07	2025-05-29 18:50:44.117+07
62	38	61	13:25:00	13:25:00	90	Mua các đặc sản như chè, bánh chưng Bờ Đậu, trám đen Hà Châu.	2	\N	\N	2025-05-29 18:50:44.121+07	2025-05-29 18:50:44.121+07
63	38	62	13:25:00	13:25:00	90	Thưởng thức các món gà đặc sản.	3	\N	\N	2025-05-29 18:50:44.125+07	2025-05-29 18:50:44.125+07
64	38	63	13:25:00	13:25:00	60	Trả phòng và chuẩn bị hành lý.	4	\N	\N	2025-05-29 18:50:44.129+07	2025-05-29 18:50:44.129+07
65	39	64	13:25:00	13:25:00	180	Chùa Bút Tháp là một ngôi chùa cổ nổi tiếng với kiến trúc độc đáo và các pho tượng Phật quý giá. Tìm hiểu về lịch sử và kiến trúc của chùa.	0	\N	\N	2025-05-29 18:55:39.819+07	2025-05-29 18:55:39.819+07
66	39	65	13:25:00	13:25:00	90	Thưởng thức các món ăn đặc sản của Bắc Ninh như bánh đa kế, nem làng Bòng, gà Hồ.	1	\N	\N	2025-05-29 18:55:39.825+07	2025-05-29 18:55:39.825+07
67	39	66	13:25:00	13:25:00	120	Khám phá quy trình làm gốm truyền thống và mua sắm các sản phẩm gốm sứ độc đáo.	2	\N	\N	2025-05-29 18:55:39.828+07	2025-05-29 18:55:39.828+07
68	39	67	13:25:00	13:25:00	180	Giải trí và thư giãn bằng cách hát karaoke với bạn bè.	3	\N	\N	2025-05-29 18:55:39.831+07	2025-05-29 18:55:39.831+07
69	39	68	13:25:00	13:25:00	60	Thưởng thức các món ăn Việt Nam và quốc tế.	4	\N	\N	2025-05-29 18:55:39.835+07	2025-05-29 18:55:39.835+07
70	40	69	13:25:00	13:25:00	150	Tìm hiểu về lịch sử và văn hóa của triều đại nhà Lý tại Đền Đô, nơi thờ 8 vị vua nhà Lý.	0	\N	\N	2025-05-29 18:55:39.84+07	2025-05-29 18:55:39.84+07
71	40	70	13:25:00	13:25:00	75	Thưởng thức cơm niêu và các món ăn dân dã của vùng Kinh Bắc.	1	\N	\N	2025-05-29 18:55:39.843+07	2025-05-29 18:55:39.843+07
72	40	71	13:25:00	13:25:00	240	Tận hưởng các dịch vụ spa, hồ bơi và phòng tập gym tại khách sạn.	2	\N	\N	2025-05-29 18:55:39.847+07	2025-05-29 18:55:39.847+07
73	40	72	13:25:00	13:25:00	90	Thưởng thức nghệ thuật Quan họ truyền thống trên thuyền, một di sản văn hóa phi vật thể của UNESCO.	3	\N	\N	2025-05-29 18:55:39.851+07	2025-05-29 18:55:39.851+07
74	40	73	13:25:00	13:25:00	75	Thưởng thức các món ăn đặc sản Bắc Ninh trong không gian ấm cúng.	4	\N	\N	2025-05-29 18:55:39.855+07	2025-05-29 18:55:39.855+07
75	41	74	13:25:00	13:25:00	120	Mua sắm các sản phẩm địa phương, đặc sản Bắc Ninh và quà lưu niệm.	0	\N	\N	2025-05-29 18:55:39.859+07	2025-05-29 18:55:39.859+07
76	41	75	13:25:00	13:25:00	60	Thưởng thức món bún ốc ngon nổi tiếng tại Bắc Ninh.	1	\N	\N	2025-05-29 18:55:39.861+07	2025-05-29 18:55:39.861+07
77	41	76	13:25:00	13:25:00	75	Thưởng thức cà phê và thư giãn trước khi kết thúc chuyến đi.	2	\N	\N	2025-05-29 18:55:39.864+07	2025-05-29 18:55:39.864+07
78	42	77	13:25:00	13:25:00	60	Thưởng thức món bún đậu mắm tôm đặc trưng của Hà Nội tại một quán ăn nổi tiếng trong ngõ nhỏ.	0	\N	\N	2025-05-30 23:19:00.924+07	2025-05-30 23:19:00.924+07
79	42	78	13:25:00	13:25:00	120	Tham quan ngôi chùa cổ kính nhất Hà Nội, nằm trên một hòn đảo nhỏ giữa Hồ Tây. Tìm hiểu về lịch sử và kiến trúc độc đáo của chùa.	1	\N	\N	2025-05-30 23:19:00.936+07	2025-05-30 23:19:00.936+07
80	42	79	13:25:00	13:25:00	60	Tản bộ dọc theo bờ Hồ Tây, ngắm cảnh và tận hưởng không khí trong lành.	2	\N	\N	2025-05-30 23:19:00.947+07	2025-05-30 23:19:00.947+07
81	42	80	13:25:00	13:25:00	75	Thưởng thức món bún chả nổi tiếng tại quán ăn mà Tổng thống Obama đã từng ghé thăm.	3	\N	\N	2025-05-30 23:19:00.952+07	2025-05-30 23:19:00.952+07
82	42	81	13:25:00	13:25:00	90	Tham quan trường đại học đầu tiên của Việt Nam, tìm hiểu về lịch sử giáo dục và văn hóa của đất nước.	4	\N	\N	2025-05-30 23:19:00.957+07	2025-05-30 23:19:00.957+07
83	42	82	13:25:00	13:25:00	60	Thưởng thức món cà phê trứng trứ danh của Hà Nội tại quán cà phê lâu đời.	5	\N	\N	2025-05-30 23:19:00.961+07	2025-05-30 23:19:00.961+07
84	42	83	13:25:00	13:25:00	60	Thưởng thức nghệ thuật múa rối nước truyền thống của Việt Nam.	6	\N	\N	2025-05-30 23:19:00.965+07	2025-05-30 23:19:00.965+07
85	42	84	13:25:00	13:25:00	90	Thưởng thức các món ăn đường phố và bia hơi tại khu phố nhộn nhịp.	7	\N	\N	2025-05-30 23:19:00.969+07	2025-05-30 23:19:00.969+07
86	43	85	13:25:00	13:25:00	60	Thưởng thức món phở bò gia truyền nổi tiếng của Hà Nội.	0	\N	\N	2025-05-30 23:19:00.974+07	2025-05-30 23:19:00.974+07
87	43	86	13:25:00	13:25:00	120	Viếng Lăng Chủ tịch Hồ Chí Minh, biểu tượng của đất nước Việt Nam. (Lưu ý: Lăng có thể đóng cửa vào một số ngày).	1	\N	\N	2025-05-30 23:19:00.978+07	2025-05-30 23:19:00.978+07
88	43	87	13:25:00	13:25:00	90	Tìm hiểu về cuộc đời và sự nghiệp của Chủ tịch Hồ Chí Minh.	2	\N	\N	2025-05-30 23:19:00.982+07	2025-05-30 23:19:00.982+07
89	43	88	13:25:00	13:25:00	75	Thưởng thức món bún riêu cua thơm ngon tại quán ăn lâu đời.	3	\N	\N	2025-05-30 23:19:00.986+07	2025-05-30 23:19:00.986+07
90	43	89	13:25:00	13:25:00	120	Khám phá di tích lịch sử quan trọng của Việt Nam, nơi từng là trung tâm quyền lực của các triều đại phong kiến.	4	\N	\N	2025-05-30 23:19:00.99+07	2025-05-30 23:19:00.99+07
91	43	90	13:25:00	13:25:00	90	Mua các sản phẩm lụa, đồ thủ công mỹ nghệ và quà lưu niệm đặc trưng của Hà Nội.	5	\N	\N	2025-05-30 23:19:00.994+07	2025-05-30 23:19:00.994+07
92	43	91	13:25:00	13:25:00	90	Thưởng thức món nem nướng thơm ngon và các món ăn khác của Việt Nam.	6	\N	\N	2025-05-30 23:19:01.001+07	2025-05-30 23:19:01.001+07
93	44	92	13:25:00	13:25:00	60	Thưởng thức món bánh cuốn nóng hổi tráng bằng tay tại quán nổi tiếng.	0	\N	\N	2025-05-30 23:19:01.006+07	2025-05-30 23:19:01.006+07
94	44	93	13:25:00	13:25:00	120	Khám phá khu chợ lớn nhất Hà Nội, mua sắm quần áo, đồ gia dụng và các sản phẩm khác.	1	\N	\N	2025-05-30 23:19:01.011+07	2025-05-30 23:19:01.011+07
95	44	94	13:25:00	13:25:00	75	Thưởng thức bữa cơm trưa với các món ăn Việt Nam truyền thống.	2	\N	\N	2025-05-30 23:19:01.015+07	2025-05-30 23:19:01.015+07
96	44	95	13:25:00	13:25:00	120	Mua sắm các sản phẩm thời trang, mỹ phẩm và các mặt hàng khác tại trung tâm thương mại hiện đại.	3	\N	\N	2025-05-30 23:19:01.018+07	2025-05-30 23:19:01.018+07
97	44	96	13:25:00	13:25:00	60	Thưởng thức trà chanh và ngắm nhìn Nhà thờ Lớn Hà Nội.	4	\N	\N	2025-05-30 23:19:01.022+07	2025-05-30 23:19:01.022+07
98	46	97	13:25:00	13:25:00	60	Thưởng thức phở bò truyền thống nổi tiếng của Hà Nội.	0	\N	\N	2025-05-31 23:28:32.104+07	2025-05-31 23:28:32.104+07
99	46	98	13:25:00	13:25:00	120	Khám phá vẻ đẹp cổ kính và linh thiêng của Hồ Hoàn Kiếm và Đền Ngọc Sơn.	1	\N	\N	2025-05-31 23:28:32.125+07	2025-05-31 23:28:32.125+07
100	46	99	13:25:00	13:25:00	90	Trải nghiệm mua sắm tại khu chợ lớn nhất Hà Nội, với nhiều mặt hàng đa dạng.	2	\N	\N	2025-05-31 23:28:32.143+07	2025-05-31 23:28:32.143+07
101	46	100	13:25:00	13:25:00	60	Thưởng thức món bún chả nổi tiếng được Tổng thống Obama ghé thăm.	3	\N	\N	2025-05-31 23:28:32.163+07	2025-05-31 23:28:32.163+07
102	46	101	13:25:00	13:25:00	60	Ngồi xích lô thư giãn và ngắm nhìn kiến trúc cổ kính của khu phố cổ.	4	\N	\N	2025-05-31 23:28:32.178+07	2025-05-31 23:28:32.178+07
103	46	102	13:25:00	13:25:00	60	Thưởng thức cà phê trứng trứ danh của Hà Nội.	5	\N	\N	2025-05-31 23:28:32.195+07	2025-05-31 23:28:32.195+07
104	46	103	13:25:00	13:25:00	90	Thưởng thức các món ăn Việt Nam truyền thống trong không gian lãng mạn.	6	\N	\N	2025-05-31 23:28:32.211+07	2025-05-31 23:28:32.211+07
105	47	104	13:25:00	13:25:00	60	Thưởng thức món bánh cuốn nóng hổi tráng mỏng.	0	\N	\N	2025-05-31 23:28:32.232+07	2025-05-31 23:28:32.232+07
106	47	105	13:25:00	13:25:00	120	Tìm hiểu về lịch sử giáo dục Việt Nam tại trường đại học đầu tiên của đất nước.	1	\N	\N	2025-05-31 23:28:32.249+07	2025-05-31 23:28:32.249+07
107	47	106	13:25:00	13:25:00	90	Viếng Lăng Bác và tìm hiểu về cuộc đời và sự nghiệp của Chủ tịch Hồ Chí Minh.	2	\N	\N	2025-05-31 23:28:32.266+07	2025-05-31 23:28:32.266+07
108	47	107	13:25:00	13:25:00	60	Thưởng thức món nem rán và các món ăn truyền thống khác.	3	\N	\N	2025-05-31 23:28:32.286+07	2025-05-31 23:28:32.286+07
109	47	108	13:25:00	13:25:00	120	Tìm hiểu về văn hóa và phong tục tập quán của 54 dân tộc Việt Nam.	4	\N	\N	2025-05-31 23:28:32.302+07	2025-05-31 23:28:32.302+07
110	47	109	13:25:00	13:25:00	90	Mua các sản phẩm lụa tơ tằm và đồ thủ công mỹ nghệ.	5	\N	\N	2025-05-31 23:28:32.32+07	2025-05-31 23:28:32.32+07
111	47	110	13:25:00	13:25:00	90	Thưởng thức bữa tối lãng mạn với các món ăn Việt Nam hiện đại.	6	\N	\N	2025-05-31 23:28:32.338+07	2025-05-31 23:28:32.338+07
112	48	111	13:25:00	13:25:00	60	Thưởng thức xôi gà nổi tiếng của Hà Nội.	0	\N	\N	2025-05-31 23:28:32.357+07	2025-05-31 23:28:32.357+07
113	48	112	13:25:00	13:25:00	120	Chiêm ngưỡng các tác phẩm nghệ thuật đặc sắc của Việt Nam.	1	\N	\N	2025-05-31 23:28:32.379+07	2025-05-31 23:28:32.379+07
114	48	113	13:25:00	13:25:00	90	Mua các món quà lưu niệm đặc trưng của Hà Nội như ô mai, bánh cốm, trà sen...	2	\N	\N	2025-05-31 23:28:32.399+07	2025-05-31 23:28:32.399+07
115	48	114	13:25:00	13:25:00	60	Thưởng thức món chả cá Lã Vọng trứ danh của Hà Nội.	3	\N	\N	2025-05-31 23:28:32.419+07	2025-05-31 23:28:32.419+07
116	48	115	13:25:00	13:25:00	45	Thưởng thức kem Tràng Tiền, món kem quen thuộc của người Hà Nội.	4	\N	\N	2025-05-31 23:28:32.455+07	2025-05-31 23:28:32.455+07
117	48	116	13:25:00	13:25:00	60	Thư giãn sau những ngày khám phá Hà Nội.	5	\N	\N	2025-05-31 23:28:32.472+07	2025-05-31 23:28:32.472+07
118	48	117	13:25:00	13:25:00	90	Thưởng thức buffet hải sản và ngắm cảnh Hồ Tây về đêm.	6	\N	\N	2025-05-31 23:28:32.488+07	2025-05-31 23:28:32.488+07
119	49	118	13:25:00	13:25:00	60	Thưởng thức món bún chả cá nổi tiếng của Đà Nẵng.	0	\N	\N	2025-06-01 09:34:44.053+07	2025-06-01 09:34:44.053+07
120	49	119	13:25:00	13:25:00	180	Tận hưởng làn nước trong xanh và bãi cát trắng mịn của một trong những bãi biển đẹp nhất hành tinh.	1	\N	\N	2025-06-01 09:34:44.061+07	2025-06-01 09:34:44.061+07
121	49	120	13:25:00	13:25:00	90	Thưởng thức hải sản tươi ngon với nhiều món ăn hấp dẫn.	2	\N	\N	2025-06-01 09:34:44.067+07	2025-06-01 09:34:44.067+07
122	49	121	13:25:00	13:25:00	120	Khám phá nền văn hóa Chăm Pa cổ xưa với nhiều hiện vật giá trị.	3	\N	\N	2025-06-01 09:34:44.073+07	2025-06-01 09:34:44.073+07
123	49	122	13:25:00	13:25:00	90	Quán cafe với không gian đẹp, đồ uống ngon và có bán đồ lưu niệm.	4	\N	\N	2025-06-01 09:34:44.079+07	2025-06-01 09:34:44.079+07
124	49	123	13:25:00	13:25:00	90	Nhà hàng sang trọng với view sông Hàn, thích hợp cho buổi tối lãng mạn.	5	\N	\N	2025-06-01 09:34:44.084+07	2025-06-01 09:34:44.084+07
125	49	124	13:25:00	13:25:00	60	Chiêm ngưỡng màn trình diễn phun lửa và phun nước độc đáo của Cầu Rồng vào cuối tuần.	6	\N	\N	2025-06-01 09:34:44.09+07	2025-06-01 09:34:44.09+07
126	50	125	13:25:00	13:25:00	60	Di chuyển bằng taxi hoặc xe riêng đến Bà Nà Hills.	0	\N	\N	2025-06-01 09:34:44.096+07	2025-06-01 09:34:44.096+07
127	50	126	13:25:00	13:25:00	300	Khám phá khu vui chơi giải trí Bà Nà Hills, tham quan Cầu Vàng nổi tiếng.	1	\N	\N	2025-06-01 09:34:44.101+07	2025-06-01 09:34:44.101+07
128	50	127	13:25:00	13:25:00	90	Thưởng thức bữa trưa tại một trong những nhà hàng trên Bà Nà Hills.	2	\N	\N	2025-06-01 09:34:44.106+07	2025-06-01 09:34:44.106+07
129	50	128	13:25:00	13:25:00	120	Tham gia các trò chơi hấp dẫn tại khu vui chơi Fantasy Park.	3	\N	\N	2025-06-01 09:34:44.11+07	2025-06-01 09:34:44.11+07
130	50	129	13:25:00	13:25:00	60	Di chuyển bằng taxi hoặc xe riêng về Đà Nẵng.	4	\N	\N	2025-06-01 09:34:44.114+07	2025-06-01 09:34:44.114+07
131	50	130	13:25:00	13:25:00	75	Thưởng thức món mì quảng đặc trưng của Đà Nẵng.	5	\N	\N	2025-06-01 09:34:44.12+07	2025-06-01 09:34:44.12+07
132	50	131	13:25:00	13:25:00	60	Tận hưởng không khí trong lành và ngắm cảnh sông Hàn về đêm.	6	\N	\N	2025-06-01 09:34:44.126+07	2025-06-01 09:34:44.126+07
133	51	132	13:25:00	13:25:00	45	Thưởng thức bánh mì que đặc sản Đà Nẵng.	0	\N	\N	2025-06-01 09:34:44.131+07	2025-06-01 09:34:44.131+07
134	51	133	13:25:00	13:25:00	120	Viếng thăm chùa Linh Ứng Bãi Bụt, chiêm ngưỡng tượng Phật Quan Âm cao nhất Việt Nam.	1	\N	\N	2025-06-01 09:34:44.134+07	2025-06-01 09:34:44.134+07
135	51	134	13:25:00	13:25:00	90	Ngắm cảnh thiên nhiên tươi đẹp của bán đảo Sơn Trà.	2	\N	\N	2025-06-01 09:34:44.138+07	2025-06-01 09:34:44.138+07
136	51	135	13:25:00	13:25:00	90	Thưởng thức bữa trưa với các món hải sản tươi ngon.	3	\N	\N	2025-06-01 09:34:44.141+07	2025-06-01 09:34:44.141+07
137	51	136	13:25:00	13:25:00	120	Mua sắm các đặc sản và quà lưu niệm của Đà Nẵng.	4	\N	\N	2025-06-01 09:34:44.145+07	2025-06-01 09:34:44.145+07
138	51	137	13:25:00	13:25:00	60	Thưởng thức kem bơ đặc sản Đà Nẵng.	5	\N	\N	2025-06-01 09:34:44.15+07	2025-06-01 09:34:44.15+07
139	51	138	13:25:00	13:25:00	90	Nhà hàng chuyên các món ăn hải sản tươi sống.	6	\N	\N	2025-06-01 09:34:44.154+07	2025-06-01 09:34:44.154+07
276	77	139	00:25:00	09:25:00	60	Thưởng thức món bún chả cá nổi tiếng Đà Nẵng.	0	\N	\N	2025-06-01 12:58:08.793+07	2025-06-01 12:58:08.793+07
277	77	140	09:25:00	09:25:00	120	Tận hưởng làn nước trong xanh và bãi cát trắng mịn của biển Mỹ Khê.	1	\N	\N	2025-06-01 12:58:08.799+07	2025-06-01 12:58:08.799+07
278	77	141	09:25:00	09:25:00	180	Khám phá vẻ đẹp của các hang động và chùa chiền trên núi Ngũ Hành Sơn.	2	\N	\N	2025-06-01 12:58:08.803+07	2025-06-01 12:58:08.803+07
279	77	142	09:25:00	09:25:00	90	Thưởng thức hải sản tươi ngon tại nhà hàng nổi tiếng.	3	\N	\N	2025-06-01 12:58:08.811+07	2025-06-01 12:58:08.811+07
280	77	143	09:25:00	09:25:00	90	Chiêm ngưỡng và mua sắm các sản phẩm thủ công mỹ nghệ từ đá.	4	\N	\N	2025-06-01 12:58:08.815+07	2025-06-01 12:58:08.815+07
281	77	144	09:25:00	09:25:00	90	Ăn tối tại nhà hàng ven sông Hàn và xem Cầu Rồng phun lửa (vào cuối tuần).	5	\N	\N	2025-06-01 12:58:08.819+07	2025-06-01 12:58:08.819+07
282	78	145	09:25:00	09:25:00	60	Di chuyển bằng taxi hoặc xe máy đến Bà Nà Hills.	0	\N	\N	2025-06-01 12:58:08.824+07	2025-06-01 12:58:08.824+07
283	78	146	09:25:00	09:25:00	360	Tham quan Cầu Vàng, Làng Pháp, Fantasy Park và các điểm tham quan khác.	1	\N	\N	2025-06-01 12:58:08.827+07	2025-06-01 12:58:08.827+07
284	78	147	09:25:00	09:25:00	90	Ăn trưa tại một trong các nhà hàng trên Bà Nà Hills.	2	\N	\N	2025-06-01 12:58:08.83+07	2025-06-01 12:58:08.83+07
285	78	148	09:25:00	09:25:00	60	Di chuyển từ Bà Nà Hills về Đà Nẵng.	3	\N	\N	2025-06-01 12:58:08.833+07	2025-06-01 12:58:08.833+07
286	78	149	09:25:00	09:25:00	90	Thưởng thức món mỳ quảng ếch đặc sản Đà Nẵng.	4	\N	\N	2025-06-01 12:58:08.835+07	2025-06-01 12:58:08.835+07
287	79	150	09:25:00	09:25:00	60	Thưởng thức bánh mì đặc sản Đà Nẵng.	0	\N	\N	2025-06-01 12:58:08.84+07	2025-06-01 12:58:08.84+07
288	79	151	09:25:00	09:25:00	120	Khám phá các hiện vật điêu khắc Chăm Pa cổ.	1	\N	\N	2025-06-01 12:58:08.843+07	2025-06-01 12:58:08.843+07
289	79	152	09:25:00	09:25:00	120	Mua sắm quà lưu niệm, đặc sản địa phương.	2	\N	\N	2025-06-01 12:58:08.846+07	2025-06-01 12:58:08.846+07
290	79	153	09:25:00	09:25:00	60	Thưởng thức món bún mắm nêm đặc trưng của Đà Nẵng.	3	\N	\N	2025-06-01 12:58:08.849+07	2025-06-01 12:58:08.849+07
291	79	154	09:25:00	09:25:00	60	Thưởng thức cà phê và thư giãn.	4	\N	\N	2025-06-01 12:58:08.852+07	2025-06-01 12:58:08.852+07
292	79	155	09:25:00	09:25:00	60	Di chuyển ra sân bay để về.	5	\N	\N	2025-06-01 12:58:08.856+07	2025-06-01 12:58:08.856+07
321	84	184	13:25:00	13:25:00	75	Thưởng thức phở cuốn, món ăn đặc trưng của Hà Nội.	0	\N	\N	2025-06-04 22:16:41.212+07	2025-06-04 22:16:41.212+07
322	84	185	13:25:00	13:25:00	120	Khám phá lịch sử và văn hóa Hà Nội qua các hiện vật trưng bày.	1	\N	\N	2025-06-04 22:16:41.219+07	2025-06-04 22:16:41.219+07
323	84	186	13:25:00	13:25:00	75	Thưởng thức bún đậu mắm tôm, món ăn dân dã đặc trưng của Hà Nội.	2	\N	\N	2025-06-04 22:16:41.224+07	2025-06-04 22:16:41.224+07
324	84	187	13:25:00	13:25:00	150	Tham quan, mua sắm và vui chơi tại trung tâm thương mại lớn nhất Hà Nội.	3	\N	\N	2025-06-04 22:16:41.229+07	2025-06-04 22:16:41.229+07
325	84	188	13:25:00	13:25:00	60	Thưởng thức cà phê trứng, thức uống đặc biệt của Hà Nội.	4	\N	\N	2025-06-04 22:16:41.235+07	2025-06-04 22:16:41.235+07
326	84	189	13:25:00	13:25:00	90	Thưởng thức lẩu nấm với nhiều loại nấm quý hiếm.	5	\N	\N	2025-06-04 22:16:41.239+07	2025-06-04 22:16:41.239+07
327	85	190	13:25:00	13:25:00	60	Thưởng thức bánh cuốn nóng tráng mỏng, ăn kèm chả quế và nước chấm.	0	\N	\N	2025-06-04 22:16:41.244+07	2025-06-04 22:16:41.244+07
328	85	191	13:25:00	13:25:00	120	Trải nghiệm mua sắm tại chợ truyền thống, tìm hiểu về văn hóa địa phương.	1	\N	\N	2025-06-04 22:16:41.248+07	2025-06-04 22:16:41.248+07
329	85	192	13:25:00	13:25:00	75	Thưởng thức bún chả, món ăn nổi tiếng được Tổng thống Obama yêu thích.	2	\N	\N	2025-06-04 22:16:41.252+07	2025-06-04 22:16:41.252+07
330	85	193	13:25:00	13:25:00	90	Tận hưởng dịch vụ massage thư giãn sau một ngày dài.	3	\N	\N	2025-06-04 22:16:41.257+07	2025-06-04 22:16:41.257+07
331	85	194	13:25:00	13:25:00	60	Thưởng thức trà chanh, thức uống đường phố phổ biến của giới trẻ Hà Nội.	4	\N	\N	2025-06-04 22:16:41.261+07	2025-06-04 22:16:41.261+07
332	85	195	13:25:00	13:25:00	90	Thưởng thức nem nướng Nha Trang, món ăn đặc trưng của miền Trung.	5	\N	\N	2025-06-04 22:16:41.266+07	2025-06-04 22:16:41.266+07
387	95	210	03:25:00	03:25:00	240	Di chuyển bằng xe khách hoặc xe riêng từ Hà Nội đến Hạ Long (khoảng 3-4 tiếng).	0	\N	\N	2025-06-05 23:27:21.498+07	2025-06-05 23:27:21.498+07
388	95	211	03:25:00	03:25:00	90	Thưởng thức hải sản tươi ngon tại nhà hàng nổi tiếng ở Hạ Long.	1	\N	\N	2025-06-05 23:27:21.501+07	2025-06-05 23:27:21.501+07
389	95	212	03:25:00	03:25:00	60	Di chuyển từ Hạ Long đến Cảng Cái Rồng bằng taxi hoặc xe ôm.	2	\N	\N	2025-06-05 23:27:21.504+07	2025-06-05 23:27:21.504+07
390	95	213	03:25:00	03:25:00	90	Đi tàu cao tốc từ cảng Cái Rồng ra đảo Cô Tô (khoảng 1.5 tiếng).	3	\N	\N	2025-06-05 23:27:21.505+07	2025-06-05 23:27:21.505+07
391	95	214	03:25:00	03:25:00	60	Nhận phòng và nghỉ ngơi tại khách sạn.	4	\N	\N	2025-06-05 23:27:21.507+07	2025-06-05 23:27:21.507+07
392	95	215	03:25:00	03:25:00	120	Tắm biển và thư giãn tại bãi biển đẹp nhất Cô Tô.	5	\N	\N	2025-06-05 23:27:21.51+07	2025-06-05 23:27:21.51+07
393	95	216	03:25:00	03:25:00	90	Thưởng thức hải sản tươi sống tại nhà hàng địa phương.	6	\N	\N	2025-06-05 23:27:21.512+07	2025-06-05 23:27:21.512+07
394	96	217	03:25:00	03:25:00	120	Leo lên ngọn hải đăng để ngắm toàn cảnh đảo Cô Tô.	0	\N	\N	2025-06-05 23:27:21.516+07	2025-06-05 23:27:21.516+07
395	96	218	03:25:00	03:25:00	90	Chiêm ngưỡng vẻ đẹp kỳ vĩ của Bãi Đá Móng Rồng.	1	\N	\N	2025-06-05 23:27:21.518+07	2025-06-05 23:27:21.518+07
396	96	219	03:25:00	03:25:00	90	Thưởng thức các món ăn địa phương.	2	\N	\N	2025-06-05 23:27:21.52+07	2025-06-05 23:27:21.52+07
397	96	220	03:25:00	03:25:00	60	Tham quan nhà thờ cổ kính trên đảo.	3	\N	\N	2025-06-05 23:27:21.522+07	2025-06-05 23:27:21.522+07
398	96	221	03:25:00	03:25:00	120	Tắm biển và thư giãn tại bãi biển yên bình.	4	\N	\N	2025-06-05 23:27:21.525+07	2025-06-05 23:27:21.525+07
399	96	222	03:25:00	03:25:00	120	Thưởng thức hải sản nướng BBQ trên bãi biển.	5	\N	\N	2025-06-05 23:27:21.528+07	2025-06-05 23:27:21.528+07
400	97	223	03:25:00	03:25:00	60	Thưởng thức các món ăn sáng địa phương như bún, phở.	0	\N	\N	2025-06-05 23:27:21.531+07	2025-06-05 23:27:21.531+07
401	97	224	03:25:00	03:25:00	90	Mua các sản phẩm đặc sản của Cô Tô làm quà.	1	\N	\N	2025-06-05 23:27:21.534+07	2025-06-05 23:27:21.534+07
402	97	225	03:25:00	03:25:00	30	Trả phòng khách sạn và chuẩn bị di chuyển về Hạ Long.	2	\N	\N	2025-06-05 23:27:21.536+07	2025-06-05 23:27:21.536+07
403	97	226	03:25:00	03:25:00	90	Đi tàu cao tốc từ Cô Tô về cảng Cái Rồng.	3	\N	\N	2025-06-05 23:27:21.539+07	2025-06-05 23:27:21.539+07
404	97	227	03:25:00	03:25:00	60	Di chuyển từ Cảng Cái Rồng về Hạ Long bằng taxi hoặc xe ôm.	4	\N	\N	2025-06-05 23:27:21.541+07	2025-06-05 23:27:21.541+07
407	100	86	\N	\N	120	\N	0	\N	\N	2025-06-05 23:38:17.018+07	2025-06-05 23:38:17.018+07
408	100	82	\N	\N	60	\N	1	\N	\N	2025-06-05 23:38:17.022+07	2025-06-05 23:38:17.022+07
409	100	108	\N	\N	120	\N	2	\N	\N	2025-06-05 23:38:17.025+07	2025-06-05 23:38:17.025+07
410	100	89	\N	\N	120	\N	3	\N	\N	2025-06-05 23:38:17.027+07	2025-06-05 23:38:17.027+07
293	80	156	13:25:00	13:25:00	60	Thưởng thức món bún chả nổi tiếng của Ninh Bình.	0	\N	\N	2025-06-04 22:02:39.162+07	2025-06-04 22:02:39.162+07
294	80	157	13:25:00	13:25:00	120	Khám phá di tích lịch sử quan trọng của Việt Nam.	1	\N	\N	2025-06-04 22:02:39.178+07	2025-06-04 22:02:39.178+07
295	80	158	13:25:00	13:25:00	150	Ngồi thuyền ngắm cảnh sông nước hữu tình.	2	\N	\N	2025-06-04 22:02:39.183+07	2025-06-04 22:02:39.183+07
296	80	159	13:25:00	13:25:00	90	Thưởng thức các món đặc sản của Ninh Bình như dê núi, cơm cháy.	3	\N	\N	2025-06-04 22:02:39.191+07	2025-06-04 22:02:39.191+07
297	80	160	13:25:00	13:25:00	90	Ngôi chùa cổ kính nằm trong hang động.	4	\N	\N	2025-06-04 22:02:39.197+07	2025-06-04 22:02:39.197+07
298	80	161	13:25:00	13:25:00	60	Thưởng thức cafe với không gian yên tĩnh và view đẹp.	5	\N	\N	2025-06-04 22:02:39.204+07	2025-06-04 22:02:39.204+07
299	80	162	13:25:00	13:25:00	90	Thưởng thức các món dê núi đặc sản.	6	\N	\N	2025-06-04 22:02:39.212+07	2025-06-04 22:02:39.212+07
300	81	163	13:25:00	13:25:00	60	Ăn sáng tại nơi ở.	0	\N	\N	2025-06-04 22:02:39.219+07	2025-06-04 22:02:39.219+07
301	81	164	13:25:00	13:25:00	180	Ngồi thuyền khám phá các hang động kỳ vĩ.	1	\N	\N	2025-06-04 22:02:39.225+07	2025-06-04 22:02:39.225+07
302	81	165	13:25:00	13:25:00	90	Thưởng thức cơm cháy và các món ăn địa phương.	2	\N	\N	2025-06-04 22:02:39.23+07	2025-06-04 22:02:39.23+07
303	81	166	13:25:00	13:25:00	150	Tham quan quần thể chùa lớn nhất Việt Nam.	3	\N	\N	2025-06-04 22:02:39.234+07	2025-06-04 22:02:39.234+07
304	81	167	13:25:00	13:25:00	90	Mua các sản phẩm địa phương làm quà.	4	\N	\N	2025-06-04 22:02:39.239+07	2025-06-04 22:02:39.239+07
305	81	168	13:25:00	13:25:00	90	Ăn tối trước khi di chuyển về.	5	\N	\N	2025-06-04 22:02:39.245+07	2025-06-04 22:02:39.245+07
333	86	196	13:25:00	13:25:00	360	Di chuyển từ Lào Cai đến Sa Pa bằng xe khách (khoảng 1 giờ).	0	\N	\N	2025-06-05 20:55:25.829+07	2025-06-05 20:55:25.829+07
334	86	197	13:25:00	13:25:00	60	Nhận phòng và nghỉ ngơi sau chuyến đi.	1	\N	\N	2025-06-05 20:55:25.835+07	2025-06-05 20:55:25.835+07
335	86	198	13:25:00	13:25:00	60	Thưởng thức các món ăn đặc sản của Sa Pa như thắng cố, cơm lam.	2	\N	\N	2025-06-05 20:55:25.841+07	2025-06-05 20:55:25.841+07
336	86	199	13:25:00	13:25:00	90	Tham quan công trình kiến trúc cổ kính và tìm hiểu lịch sử của Sa Pa.	3	\N	\N	2025-06-05 20:55:25.845+07	2025-06-05 20:55:25.845+07
337	86	200	13:25:00	13:25:00	60	Tản bộ quanh hồ, ngắm cảnh và tận hưởng không khí trong lành.	4	\N	\N	2025-06-05 20:55:25.849+07	2025-06-05 20:55:25.849+07
338	86	201	13:25:00	13:25:00	90	Thưởng thức các món nướng và đặc sản địa phương tại chợ đêm.	5	\N	\N	2025-06-05 20:55:25.853+07	2025-06-05 20:55:25.853+07
339	87	202	13:25:00	13:25:00	180	Leo núi Hàm Rồng, ngắm toàn cảnh Sa Pa từ trên cao và tham quan các vườn hoa.	0	\N	\N	2025-06-05 20:55:25.859+07	2025-06-05 20:55:25.859+07
340	87	203	13:25:00	13:25:00	60	Ăn trưa và nghỉ ngơi trước khi tham quan bản Cát Cát.	1	\N	\N	2025-06-05 20:55:25.862+07	2025-06-05 20:55:25.862+07
341	87	204	13:25:00	13:25:00	180	Khám phá bản làng của người H'Mông, tìm hiểu văn hóa và phong tục tập quán của họ.	2	\N	\N	2025-06-05 20:55:25.867+07	2025-06-05 20:55:25.867+07
342	87	205	13:25:00	13:25:00	90	Uống cafe và ngắm cảnh hoàng hôn.	3	\N	\N	2025-06-05 20:55:25.872+07	2025-06-05 20:55:25.872+07
343	87	206	13:25:00	13:25:00	90	Thưởng thức món lẩu cá tầm đặc sản của Sa Pa.	4	\N	\N	2025-06-05 20:55:25.877+07	2025-06-05 20:55:25.877+07
344	88	207	13:25:00	13:25:00	90	Mua các sản phẩm thủ công mỹ nghệ, thổ cẩm làm quà.	0	\N	\N	2025-06-05 20:55:25.882+07	2025-06-05 20:55:25.882+07
345	88	208	13:25:00	13:25:00	60	Ăn trưa và chuẩn bị hành lý.	1	\N	\N	2025-06-05 20:55:25.887+07	2025-06-05 20:55:25.887+07
346	88	209	13:25:00	13:25:00	60	Di chuyển về Lào Cai bằng xe khách.	2	\N	\N	2025-06-05 20:55:25.892+07	2025-06-05 20:55:25.892+07
405	97	228	03:25:00	03:25:00	90	Ăn trưa tại Hạ Long trước khi về Hà Nội.	5	\N	\N	2025-06-05 23:27:21.543+07	2025-06-05 23:27:21.543+07
406	97	229	03:25:00	03:25:00	240	Di chuyển bằng xe khách hoặc xe riêng từ Hạ Long về Hà Nội.	6	\N	\N	2025-06-05 23:27:21.546+07	2025-06-05 23:27:21.546+07
306	82	169	13:25:00	13:25:00	60	Thưởng thức món bún bò Huế trứ danh tại quán Bà Rớt nổi tiếng.	0	\N	\N	2025-06-04 22:07:19.259+07	2025-06-04 22:07:19.259+07
307	82	170	13:25:00	13:25:00	180	Khám phá Hoàng thành, Tử Cấm Thành, Ngọ Môn, Điện Thái Hòa,... Tìm hiểu về lịch sử triều Nguyễn.	1	\N	\N	2025-06-04 22:07:19.266+07	2025-06-04 22:07:19.266+07
308	82	171	13:25:00	13:25:00	90	Chiêm ngưỡng các cổ vật quý giá của triều Nguyễn.	2	\N	\N	2025-06-04 22:07:19.271+07	2025-06-04 22:07:19.271+07
309	82	172	13:25:00	13:25:00	90	Thưởng thức các món ăn cung đình Huế được chế biến cầu kỳ.	3	\N	\N	2025-06-04 22:07:19.276+07	2025-06-04 22:07:19.276+07
310	82	173	13:25:00	13:25:00	120	Chiêm ngưỡng kiến trúc độc đáo và tìm hiểu về cuộc đời vua Tự Đức.	4	\N	\N	2025-06-04 22:07:19.281+07	2025-06-04 22:07:19.281+07
311	82	174	13:25:00	13:25:00	60	Nghỉ ngơi và thưởng thức cà phê.	5	\N	\N	2025-06-04 22:07:19.286+07	2025-06-04 22:07:19.286+07
312	82	175	13:25:00	13:25:00	75	Thưởng thức món bánh khoái đặc sản Huế.	6	\N	\N	2025-06-04 22:07:19.29+07	2025-06-04 22:07:19.29+07
313	82	176	13:25:00	13:25:00	90	Nghe ca Huế và ngắm cảnh sông Hương về đêm.	7	\N	\N	2025-06-04 22:07:19.294+07	2025-06-04 22:07:19.294+07
314	83	177	13:25:00	13:25:00	60	Thưởng thức món cơm hến đặc sản Huế.	0	\N	\N	2025-06-04 22:07:19.302+07	2025-06-04 22:07:19.302+07
315	83	178	13:25:00	13:25:00	90	Tham quan ngôi chùa cổ kính và ngắm nhìn sông Hương.	1	\N	\N	2025-06-04 22:07:19.306+07	2025-06-04 22:07:19.306+07
316	83	179	13:25:00	13:25:00	90	Tìm hiểu quy trình làm hương truyền thống và chụp ảnh.	2	\N	\N	2025-06-04 22:07:19.31+07	2025-06-04 22:07:19.31+07
317	83	180	13:25:00	13:25:00	60	Thưởng thức món bún thịt nướng ngon rẻ.	3	\N	\N	2025-06-04 22:07:19.315+07	2025-06-04 22:07:19.315+07
318	83	181	13:25:00	13:25:00	120	Mua sắm đặc sản Huế và quà lưu niệm.	4	\N	\N	2025-06-04 22:07:19.32+07	2025-06-04 22:07:19.32+07
319	83	182	13:25:00	13:25:00	60	Thưởng thức các loại chè Huế.	5	\N	\N	2025-06-04 22:07:19.324+07	2025-06-04 22:07:19.324+07
320	83	183	13:25:00	13:25:00	75	Thưởng thức các món chay ngon miệng.	6	\N	\N	2025-06-04 22:07:19.328+07	2025-06-04 22:07:19.328+07
\.


--
-- Data for Name: nearby_places; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nearby_places (place_id, nearby_place_id, distance_km) FROM stdin;
198	197	0.20
199	197	0.26
17	16	0.56
18	16	1.95
199	198	0.07
19	16	0.57
19	17	0.09
200	197	0.21
200	198	0.14
200	199	0.13
201	197	0.07
201	198	0.16
21	16	0.43
21	17	0.84
21	19	0.80
201	199	0.20
201	200	0.14
22	16	0.71
22	17	0.80
22	19	0.73
202	197	0.59
22	21	0.45
202	198	0.39
202	199	0.36
25	24	0.63
26	24	1.68
26	25	1.92
202	200	0.48
27	24	0.83
27	25	0.22
27	26	1.96
202	201	0.55
203	197	1.09
203	198	1.26
203	199	1.28
203	200	1.15
203	201	1.11
203	202	1.64
29	16	1.90
29	17	1.59
29	18	1.92
29	19	1.67
204	197	1.41
204	198	1.57
204	199	1.58
204	200	1.45
204	201	1.42
204	202	1.93
204	203	0.34
205	203	1.33
205	204	1.09
32	16	1.26
32	17	1.70
32	18	0.94
32	19	1.74
206	197	0.11
32	21	1.48
32	22	1.91
206	198	0.11
206	199	0.15
33	16	0.92
33	17	1.08
33	19	1.00
206	200	0.11
33	21	0.56
33	22	0.28
206	201	0.06
206	202	0.49
34	18	0.79
34	29	1.28
34	32	1.51
206	203	1.16
35	16	0.73
35	17	0.99
35	19	0.93
206	204	1.46
35	21	0.33
35	22	0.28
207	197	0.07
207	198	0.16
35	32	1.79
35	33	0.24
207	199	0.20
36	16	1.53
207	200	0.14
36	21	1.42
36	22	1.84
207	201	0.00
36	32	1.10
36	33	1.81
36	35	1.59
207	202	0.55
207	203	1.11
207	204	1.42
207	206	0.06
208	197	0.23
208	198	0.39
208	199	0.42
208	200	0.30
208	201	0.24
208	202	0.78
208	203	0.87
208	204	1.18
208	206	0.29
208	207	0.24
209	197	0.23
39	38	0.56
40	38	0.72
40	39	0.65
41	38	0.69
41	39	0.50
41	40	0.18
42	38	0.87
42	39	0.84
42	40	1.43
42	41	1.31
43	38	0.59
43	39	0.47
43	40	0.19
43	41	0.10
43	42	1.25
209	198	0.39
47	38	0.00
47	39	0.56
47	40	0.72
47	41	0.69
47	42	0.87
47	43	0.59
48	38	0.66
48	39	0.70
48	40	1.25
48	41	1.14
48	42	0.21
48	43	1.07
48	47	0.66
49	38	0.00
49	39	0.56
49	40	0.72
49	41	0.69
49	42	0.87
49	43	0.59
49	47	0.00
49	48	0.66
50	38	0.00
50	39	0.56
50	40	0.72
50	41	0.69
50	42	0.87
50	43	0.59
50	47	0.00
50	48	0.66
50	49	0.00
51	38	0.00
51	39	0.56
51	40	0.72
51	41	0.69
51	42	0.87
51	43	0.59
51	47	0.00
51	48	0.66
51	49	0.00
51	50	0.00
52	38	0.00
52	39	0.56
52	40	0.72
52	41	0.69
52	42	0.87
52	43	0.59
52	47	0.00
52	48	0.66
52	49	0.00
52	50	0.00
52	51	0.00
15	16	0.64
15	17	1.17
15	19	1.15
209	199	0.42
15	21	0.40
15	22	0.83
209	200	0.30
209	201	0.24
209	202	0.78
209	203	0.87
209	204	1.18
209	206	0.29
15	32	1.24
15	33	0.85
15	35	0.62
15	36	1.01
23	24	1.18
23	25	0.56
23	27	0.41
30	16	0.80
30	17	0.61
30	19	0.52
30	21	0.73
30	22	0.37
30	33	0.60
30	35	0.65
30	15	1.13
20	16	0.69
20	17	0.71
20	19	0.63
20	21	0.50
20	22	0.11
20	32	1.92
20	33	0.38
20	35	0.39
20	36	1.91
20	30	0.26
20	15	0.90
45	46	0.00
37	16	1.08
37	17	1.53
37	18	1.05
37	19	1.57
37	21	1.31
37	22	1.74
37	32	0.18
37	33	1.87
37	34	1.53
37	35	1.63
37	36	1.09
37	30	1.88
37	20	1.74
37	15	1.09
54	53	0.89
55	53	0.15
55	54	1.04
57	53	0.29
57	54	0.77
57	55	0.40
58	53	0.58
58	54	1.39
58	55	0.47
58	57	0.62
59	53	0.00
59	54	0.89
59	55	0.15
59	57	0.29
59	58	0.58
61	53	0.59
61	54	0.55
61	55	0.71
61	57	0.32
61	58	0.91
61	59	0.59
62	53	0.46
62	54	0.58
62	55	0.58
62	57	0.55
62	58	1.03
62	59	0.46
62	61	0.62
63	53	0.00
63	54	0.89
63	55	0.15
63	57	0.29
63	58	0.58
63	59	0.00
63	61	0.59
63	62	0.46
68	67	1.22
70	65	0.70
71	67	1.12
71	68	1.38
72	69	0.38
73	67	0.30
73	68	1.44
73	71	1.00
74	67	0.98
74	71	1.14
74	73	0.68
75	67	0.38
75	68	1.48
75	71	0.95
75	73	0.09
75	74	0.61
76	67	0.08
76	68	1.24
76	71	1.05
76	73	0.23
76	74	0.91
76	75	0.31
28	16	0.20
28	17	0.59
28	19	0.56
28	21	0.27
28	22	0.51
28	32	1.42
28	33	0.72
28	35	0.53
28	36	1.56
28	30	0.65
28	20	0.50
28	37	1.25
28	15	0.58
79	78	1.33
80	77	0.91
81	77	1.23
82	77	1.11
82	80	1.16
83	77	0.79
83	80	0.86
83	81	1.97
83	82	0.36
84	77	1.00
84	80	1.38
84	81	1.96
84	82	0.44
84	83	0.53
85	77	0.20
85	80	0.88
85	81	1.39
85	82	0.92
85	83	0.60
85	84	0.81
86	77	1.77
86	78	1.52
86	81	1.18
86	84	1.90
86	85	1.81
87	77	1.77
87	78	1.29
87	81	1.36
87	84	1.77
87	85	1.78
87	86	0.26
88	77	1.08
88	78	1.91
88	80	1.58
88	81	1.90
88	82	0.68
88	83	0.76
88	84	0.24
88	85	0.91
88	86	1.71
88	87	1.56
89	77	1.41
89	78	1.28
89	81	1.49
89	82	1.61
89	83	1.58
89	84	1.17
89	85	1.36
89	86	0.81
89	87	0.62
89	88	0.95
90	77	0.84
90	80	1.10
90	81	1.94
90	82	0.31
90	83	0.25
90	84	0.28
90	85	0.64
90	87	1.94
90	88	0.51
90	89	1.37
91	77	0.29
91	80	0.68
91	81	1.52
91	82	0.89
91	83	0.54
91	84	0.88
91	85	0.20
91	87	1.98
91	88	1.02
91	89	1.55
91	90	0.66
92	78	1.08
92	79	0.43
93	77	1.29
93	78	1.97
93	80	1.67
93	82	0.60
93	83	0.81
93	84	0.31
93	85	1.11
93	86	1.95
93	87	1.78
93	88	0.27
93	89	1.17
93	90	0.57
93	91	1.19
94	77	1.24
94	80	1.53
94	82	0.43
94	83	0.67
94	84	0.25
94	85	1.05
94	87	1.91
94	88	0.36
94	89	1.30
94	90	0.46
94	91	1.10
94	93	0.17
95	77	1.17
95	80	0.99
95	81	1.67
95	83	1.67
95	85	1.31
95	90	1.84
95	91	1.20
96	77	0.58
96	80	0.76
96	81	1.79
96	82	0.56
96	83	0.21
96	84	0.63
96	85	0.40
96	88	0.83
96	89	1.54
96	90	0.37
96	91	0.33
96	93	0.93
96	94	0.82
96	95	1.48
97	77	0.69
97	80	1.22
97	81	1.67
97	82	0.61
97	83	0.49
97	84	0.32
97	85	0.51
97	86	1.73
97	87	1.63
97	88	0.40
97	89	1.09
97	90	0.31
97	91	0.63
97	93	0.60
97	94	0.57
97	95	1.82
97	96	0.47
98	77	0.78
98	80	0.42
98	82	0.74
98	83	0.44
98	84	0.97
98	85	0.67
98	88	1.19
98	89	1.92
98	90	0.69
98	91	0.49
98	93	1.25
98	94	1.11
98	95	1.32
98	96	0.39
98	97	0.86
99	77	1.08
99	80	1.44
99	82	0.43
99	83	0.58
99	84	0.09
99	85	0.89
99	86	1.95
99	87	1.80
99	88	0.25
99	89	1.20
99	90	0.34
99	91	0.96
99	93	0.23
99	94	0.17
99	96	0.70
99	97	0.40
99	98	1.03
100	77	1.19
100	80	0.31
100	82	1.20
100	83	0.96
100	84	1.50
100	85	1.14
100	88	1.72
100	90	1.21
100	91	0.94
100	93	1.76
100	94	1.61
100	95	1.22
100	96	0.93
100	97	1.40
100	98	0.54
100	99	1.54
101	77	0.69
101	80	0.85
101	81	1.87
101	82	0.43
101	83	0.10
101	84	0.53
101	85	0.50
101	88	0.74
101	89	1.52
101	90	0.25
101	91	0.46
101	93	0.82
101	94	0.70
101	95	1.61
101	96	0.13
101	97	0.43
101	98	0.45
101	99	0.59
101	100	0.99
102	77	1.05
102	80	1.16
102	82	0.08
102	83	0.32
102	84	0.37
102	85	0.85
102	88	0.61
102	89	1.53
102	90	0.23
102	91	0.84
102	93	0.56
102	94	0.40
102	95	1.99
102	96	0.51
102	97	0.53
102	98	0.73
102	99	0.37
102	100	1.21
102	101	0.38
103	77	0.12
103	80	0.95
103	81	1.28
103	82	1.02
103	83	0.71
103	84	0.88
103	85	0.11
103	86	1.73
103	87	1.71
103	88	0.96
103	89	1.32
103	90	0.73
103	91	0.28
103	93	1.17
103	94	1.12
103	95	1.28
103	96	0.51
103	97	0.57
103	98	0.76
103	99	0.96
103	100	1.22
103	101	0.61
103	102	0.95
104	77	1.85
104	80	1.07
104	83	1.92
104	85	1.89
104	91	1.71
104	95	1.09
104	96	1.83
104	98	1.47
104	100	0.99
104	101	1.92
104	103	1.93
105	77	0.96
105	80	1.75
105	81	0.28
105	83	1.72
105	84	1.75
105	85	1.12
105	86	1.29
105	87	1.43
105	88	1.72
105	89	1.44
105	90	1.70
105	91	1.25
105	93	1.98
105	95	1.44
105	96	1.52
105	97	1.44
105	98	1.73
105	99	1.83
105	101	1.62
105	102	1.93
105	103	1.01
106	77	1.76
106	78	1.52
106	81	1.18
106	84	1.89
106	85	1.80
106	86	0.01
106	87	0.25
106	88	1.70
106	89	0.80
106	91	1.99
106	93	1.94
106	97	1.72
106	99	1.94
106	103	1.72
106	105	1.29
107	77	0.47
107	80	1.13
107	81	1.47
107	82	0.78
107	83	0.56
107	84	0.54
107	85	0.31
107	86	1.66
107	87	1.60
107	88	0.61
107	89	1.11
107	90	0.47
107	91	0.47
107	93	0.83
107	94	0.80
107	95	1.62
107	96	0.45
107	97	0.23
107	98	0.82
107	99	0.63
107	100	1.35
107	101	0.47
107	102	0.70
107	103	0.35
107	105	1.23
107	106	1.65
109	77	0.74
109	80	1.00
109	81	1.87
109	82	0.38
109	83	0.19
109	84	0.38
109	85	0.54
109	87	1.94
109	88	0.59
109	89	1.40
109	90	0.11
109	91	0.55
109	93	0.68
109	94	0.57
109	95	1.73
109	96	0.25
109	97	0.31
109	98	0.60
109	99	0.45
109	100	1.13
109	101	0.15
109	102	0.31
109	103	0.64
109	105	1.62
109	107	0.41
110	77	0.54
110	80	1.07
110	81	1.60
110	82	0.64
110	83	0.43
110	84	0.45
110	85	0.36
110	86	1.78
110	87	1.71
110	88	0.57
110	89	1.19
110	90	0.34
110	91	0.46
110	93	0.75
110	94	0.70
110	95	1.65
110	96	0.34
110	97	0.17
110	98	0.73
110	99	0.54
110	100	1.27
110	101	0.34
110	102	0.57
110	103	0.43
110	105	1.36
110	106	1.77
110	107	0.14
110	109	0.28
111	77	1.08
111	80	1.18
111	82	0.06
111	83	0.35
111	84	0.38
111	85	0.88
111	88	0.62
111	89	1.55
111	90	0.26
111	91	0.87
111	93	0.55
111	94	0.39
111	96	0.54
111	97	0.55
111	98	0.75
111	99	0.38
111	100	1.23
111	101	0.41
111	102	0.03
111	103	0.98
111	105	1.96
111	107	0.73
111	109	0.34
111	110	0.59
112	77	1.48
112	78	1.73
112	81	0.90
112	83	1.98
112	84	1.72
112	85	1.53
112	86	0.31
112	87	0.46
112	88	1.56
112	89	0.77
112	90	1.83
112	91	1.73
112	93	1.82
112	94	1.92
112	96	1.86
112	97	1.52
112	99	1.78
112	101	1.89
112	103	1.45
112	105	0.99
112	106	0.31
112	107	1.42
112	109	1.81
112	110	1.55
113	77	0.63
113	80	1.04
113	81	1.73
113	82	0.52
113	83	0.31
113	84	0.39
113	85	0.44
113	86	1.90
113	87	1.81
113	88	0.55
113	89	1.28
113	90	0.21
113	91	0.49
113	93	0.70
113	94	0.62
113	95	1.69
113	96	0.28
113	97	0.20
113	98	0.66
113	99	0.47
113	100	1.20
113	101	0.24
113	102	0.44
113	103	0.52
113	105	1.49
113	106	1.89
113	107	0.27
113	109	0.15
113	110	0.13
113	111	0.47
113	112	1.67
114	77	0.72
114	80	1.30
114	81	1.62
114	82	0.69
114	83	0.59
114	84	0.34
114	85	0.55
114	86	1.64
114	87	1.54
114	88	0.36
114	89	0.99
114	90	0.40
114	91	0.69
114	93	0.60
114	94	0.59
114	95	1.86
114	96	0.56
114	97	0.09
114	98	0.95
114	99	0.42
114	100	1.49
114	101	0.52
114	102	0.61
114	103	0.59
114	105	1.41
114	106	1.63
114	107	0.25
114	109	0.41
114	110	0.23
114	111	0.63
114	112	1.44
114	113	0.29
115	77	1.01
115	80	0.39
115	82	0.85
115	83	0.62
115	84	1.15
115	85	0.91
115	88	1.38
115	90	0.87
115	91	0.72
115	93	1.41
115	94	1.25
115	95	1.38
115	96	0.61
115	97	1.08
115	98	0.24
115	99	1.19
115	100	0.35
115	101	0.65
115	102	0.86
115	103	1.00
115	104	1.34
115	105	1.94
115	107	1.06
115	109	0.79
115	110	0.96
115	111	0.87
115	113	0.88
115	114	1.17
116	77	0.88
116	78	1.98
116	80	1.46
116	81	1.70
116	82	0.72
116	83	0.70
116	84	0.30
116	85	0.72
116	86	1.60
116	87	1.48
116	88	0.22
116	89	0.90
116	90	0.48
116	91	0.86
116	93	0.48
116	94	0.52
116	96	0.71
116	97	0.24
116	98	1.09
116	99	0.36
116	100	1.63
116	101	0.65
116	102	0.64
116	103	0.76
116	105	1.51
116	106	1.59
116	107	0.41
116	109	0.52
116	110	0.40
116	111	0.66
116	112	1.42
116	113	0.43
116	114	0.17
116	115	1.30
117	79	1.66
117	92	1.84
120	119	1.34
121	118	0.93
122	118	0.37
122	121	1.22
123	118	0.39
123	121	1.32
123	122	0.23
124	118	0.95
124	119	1.72
124	120	1.92
124	121	0.89
124	122	0.94
124	123	1.16
126	125	0.00
127	125	0.00
127	126	0.00
128	125	0.00
128	126	0.00
128	127	0.00
129	118	1.86
129	121	1.06
129	124	1.92
130	118	0.10
130	121	0.87
130	122	0.37
130	123	0.45
130	124	0.85
130	129	1.83
131	118	0.44
131	121	1.03
131	122	0.30
131	123	0.53
131	124	0.64
131	130	0.36
132	118	0.27
132	121	0.80
132	122	0.63
132	123	0.61
132	124	1.07
132	129	1.64
132	130	0.31
132	131	0.67
134	133	1.82
135	133	1.82
135	134	0.00
136	118	0.71
136	121	1.55
136	122	0.35
136	123	0.41
136	124	1.13
136	130	0.72
136	131	0.55
136	132	0.97
137	118	0.27
137	121	0.80
137	122	0.63
137	123	0.61
137	124	1.07
137	129	1.64
137	130	0.31
137	131	0.67
137	132	0.00
137	136	0.97
138	119	1.25
138	120	0.76
138	121	1.99
138	122	1.88
138	124	1.16
138	130	1.94
138	131	1.63
138	136	1.89
139	118	0.19
139	121	1.10
139	122	0.34
139	123	0.25
139	124	1.10
139	130	0.28
139	131	0.52
139	132	0.37
139	136	0.63
139	137	0.37
140	119	0.02
140	120	1.34
140	124	1.74
140	138	1.25
142	120	0.72
142	138	1.13
143	141	0.54
144	118	0.63
144	121	1.03
144	122	0.51
144	123	0.74
144	124	0.45
144	130	0.54
144	131	0.22
144	132	0.84
144	136	0.69
144	137	0.84
144	138	1.41
144	139	0.74
146	145	0.00
147	145	0.00
147	146	0.00
148	118	1.79
148	121	1.00
148	124	1.87
148	129	0.07
148	130	1.77
148	132	1.57
148	137	1.57
148	139	1.94
149	118	1.13
149	121	0.94
149	122	1.50
149	123	1.44
149	124	1.71
149	129	1.07
149	130	1.16
149	131	1.51
149	132	0.87
149	136	1.83
149	137	0.87
149	139	1.20
149	144	1.63
149	148	1.01
150	118	0.19
150	121	0.74
150	122	0.50
150	123	0.58
150	124	0.83
150	129	1.70
150	130	0.13
150	131	0.45
150	132	0.25
150	136	0.85
150	137	0.25
150	138	1.96
150	139	0.38
150	144	0.59
150	148	1.64
150	149	1.06
151	118	0.77
151	119	1.97
151	121	0.35
151	122	0.98
151	123	1.13
151	124	0.55
151	129	1.40
151	130	0.69
151	131	0.75
151	132	0.75
151	136	1.29
151	137	0.75
151	138	1.69
151	139	0.96
151	140	1.99
151	144	0.71
151	148	1.34
151	149	1.19
151	150	0.58
152	118	0.28
152	121	1.02
152	122	0.20
152	123	0.39
152	124	0.78
152	130	0.23
152	131	0.17
152	132	0.53
152	136	0.53
152	137	0.53
152	138	1.80
152	139	0.35
152	144	0.39
152	148	1.96
152	149	1.39
152	150	0.34
152	151	0.78
153	118	1.01
153	121	1.12
153	122	1.35
153	123	1.25
153	124	1.75
153	129	1.40
153	130	1.07
153	131	1.43
153	132	0.76
153	136	1.66
153	137	0.76
153	139	1.03
153	144	1.59
153	148	1.34
153	149	0.33
153	150	1.00
153	151	1.29
153	152	1.28
154	118	0.58
154	121	0.88
154	122	0.55
154	123	0.77
154	124	0.39
154	129	1.94
154	130	0.48
154	131	0.25
154	132	0.75
154	136	0.79
154	137	0.75
154	138	1.46
154	139	0.72
154	144	0.15
154	148	1.88
154	149	1.51
154	150	0.50
154	151	0.56
154	152	0.39
154	153	1.49
159	158	0.14
160	158	0.39
160	159	0.25
161	158	0.49
161	159	0.37
161	160	0.33
162	157	0.50
163	156	0.72
163	158	1.88
163	159	1.89
163	161	1.72
163	162	1.78
165	157	1.86
165	164	0.21
167	156	0.23
167	163	0.59
168	156	0.47
168	163	1.13
168	167	0.69
170	169	1.43
171	169	1.85
171	170	0.43
172	169	1.01
174	169	1.09
174	170	0.81
174	171	1.15
174	172	1.47
175	169	1.04
175	170	0.46
175	171	0.87
175	172	1.69
175	174	0.41
176	169	1.06
176	170	0.93
176	171	1.27
176	172	1.36
176	174	0.13
176	175	0.52
177	169	0.80
177	170	1.70
177	172	0.47
177	174	1.00
177	175	1.24
177	176	0.89
179	173	0.71
180	178	0.35
181	169	1.15
181	170	0.30
181	171	0.71
181	172	1.94
181	174	0.75
181	175	0.34
181	176	0.86
181	177	1.51
182	169	1.34
182	170	0.72
182	171	0.98
182	172	1.72
182	174	0.26
182	175	0.47
182	176	0.36
182	177	1.25
182	181	0.76
183	169	0.92
183	170	1.04
183	171	1.41
183	172	1.19
183	174	0.28
183	175	0.59
183	176	0.17
183	177	0.72
183	181	0.92
183	182	0.53
184	108	1.53
186	77	0.75
186	80	0.26
186	81	1.95
186	82	0.92
186	83	0.61
186	84	1.12
186	85	0.68
186	88	1.33
186	90	0.84
186	91	0.49
186	93	1.41
186	94	1.28
186	95	1.15
186	96	0.50
186	97	0.97
186	98	0.18
186	99	1.18
186	100	0.46
186	101	0.59
186	102	0.91
186	103	0.76
186	104	1.32
186	105	1.67
186	107	0.89
186	109	0.74
186	110	0.83
186	111	0.93
186	113	0.78
186	114	1.06
186	115	0.29
186	116	1.21
188	77	0.88
188	80	0.88
188	82	0.29
188	83	0.10
188	84	0.56
188	85	0.70
188	88	0.80
188	89	1.65
188	90	0.29
188	91	0.63
188	93	0.81
188	94	0.66
188	95	1.73
188	96	0.30
188	97	0.57
188	98	0.46
188	99	0.60
188	100	0.95
188	101	0.20
188	102	0.28
188	103	0.80
188	104	1.92
188	105	1.82
188	107	0.66
188	109	0.26
188	110	0.52
188	111	0.30
188	113	0.40
188	114	0.66
188	115	0.60
188	116	0.76
188	186	0.63
189	185	1.56
191	187	1.12
192	77	1.03
192	80	0.21
192	82	1.06
192	83	0.80
192	84	1.33
192	85	0.97
192	88	1.56
192	90	1.05
192	91	0.77
192	93	1.61
192	94	1.46
192	95	1.20
192	96	0.75
192	97	1.23
192	98	0.37
192	99	1.39
192	100	0.17
192	101	0.82
192	102	1.07
192	103	1.05
192	104	1.13
192	105	1.92
192	107	1.17
192	109	0.96
192	110	1.09
192	111	1.08
192	113	1.03
192	114	1.32
192	115	0.22
192	116	1.46
192	186	0.29
192	188	0.80
193	77	0.86
193	80	0.23
193	82	0.93
193	83	0.64
193	84	1.17
193	85	0.78
193	88	1.38
193	90	0.88
193	91	0.59
193	93	1.45
193	94	1.31
193	95	1.19
193	96	0.57
193	97	1.04
193	98	0.20
193	99	1.22
193	100	0.37
193	101	0.65
193	102	0.93
193	103	0.87
193	104	1.28
193	105	1.77
193	107	0.98
193	109	0.79
193	110	0.90
193	111	0.95
193	113	0.85
193	114	1.13
193	115	0.20
193	116	1.28
193	186	0.10
193	188	0.65
193	192	0.19
194	77	0.64
194	80	0.66
194	81	1.86
194	82	0.58
194	83	0.23
194	84	0.72
194	85	0.47
194	88	0.92
194	89	1.65
194	90	0.44
194	91	0.36
194	93	1.01
194	94	0.89
194	95	1.44
194	96	0.11
194	97	0.59
194	98	0.27
194	99	0.78
194	100	0.81
194	101	0.19
194	102	0.55
194	103	0.58
194	104	1.73
194	105	1.59
194	107	0.56
194	109	0.34
194	110	0.46
194	111	0.57
194	112	1.96
194	113	0.39
194	114	0.67
194	115	0.50
194	116	0.82
194	186	0.40
194	188	0.29
194	192	0.64
194	193	0.46
195	108	1.21
195	184	0.51
209	207	0.24
209	208	0.00
210	77	1.30
210	81	0.21
210	84	1.94
210	85	1.44
210	86	0.98
210	87	1.16
210	88	1.85
210	89	1.34
210	90	1.94
210	91	1.59
210	95	1.85
210	96	1.83
210	97	1.66
210	101	1.91
210	103	1.33
210	105	0.42
210	106	0.97
210	107	1.47
210	109	1.89
210	110	1.61
210	112	0.71
210	113	1.74
210	114	1.60
210	116	1.66
210	194	1.91
213	212	0.00
215	214	1.03
216	214	0.18
216	215	1.21
217	214	1.37
217	216	1.19
218	214	1.62
218	216	1.47
218	217	0.49
219	214	1.62
219	216	1.47
219	217	0.49
219	218	0.00
220	219	1.43
220	214	0.19
220	215	1.18
220	216	0.10
220	217	1.19
220	218	1.43
221	219	1.21
221	214	0.43
221	215	1.31
221	216	0.33
221	217	1.03
221	218	1.21
221	220	0.25
222	219	1.62
222	214	0.00
222	215	1.03
222	216	0.18
222	217	1.37
222	218	1.62
222	220	0.19
222	221	0.43
223	219	1.62
223	214	0.00
223	215	1.03
223	216	0.18
223	217	1.37
223	218	1.62
223	220	0.19
223	221	0.43
223	222	0.00
224	219	1.40
224	214	0.27
224	215	1.13
224	216	0.25
224	217	1.21
224	218	1.40
224	220	0.15
224	221	0.19
224	222	0.27
224	223	0.27
225	219	1.62
225	214	0.00
225	215	1.03
225	216	0.18
225	217	1.37
225	218	1.62
225	220	0.19
225	221	0.43
225	222	0.00
225	223	0.00
225	224	0.27
226	219	1.38
226	214	0.31
226	215	1.14
226	216	0.29
226	217	1.20
226	218	1.38
226	220	0.19
226	221	0.18
226	222	0.31
226	223	0.31
226	224	0.05
226	225	0.31
227	212	0.00
227	213	0.00
228	211	0.15
229	211	0.92
229	228	1.00
\.


--
-- Data for Name: place_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.place_photos (id, place_id, user_id, url, caption, is_primary, created_at) FROM stdin;
\.


--
-- Data for Name: places; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.places (id, name, category_id, city_id, address, description, latitude, longitude, image_url, opening_hours, contact_info, website, avg_duration_minutes, price_level, rating, created_at, updated_at) FROM stdin;
16	Tham quan Dinh Độc Lập	\N	\N	135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1, Thành phố Hồ Chí Minh	\N	10.7758000	106.6958000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.3	2025-05-27 17:21:52.267+07	2025-05-27 17:21:52.267+07
17	Tham quan Nhà thờ Đức Bà Sài Gòn	\N	\N	01 Công xã Paris, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh	\N	10.7797000	106.6991000	/images/place-default.jpg	8:00 - 17:00	\N	\N	90	\N	4.6	2025-05-27 17:21:52.27+07	2025-05-27 17:21:52.27+07
18	Ăn trưa tại Bún chả Hồ Gươm	\N	\N	8 Hồ Xuân Hương, Phường 6, Quận 3, Thành phố Hồ Chí Minh	\N	10.7819000	106.6791000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.2	2025-05-27 17:21:52.273+07	2025-05-27 17:21:52.273+07
19	Tham quan Bưu điện Trung tâm Sài Gòn	\N	\N	Số 2 Công xã Paris, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh	\N	10.7792000	106.6997000	/images/place-default.jpg	8:00 - 17:00	\N	\N	60	\N	4.4	2025-05-27 17:21:52.276+07	2025-05-27 17:21:52.276+07
21	Ăn tối tại Nhà hàng Bếp Mẹ Ỉn	\N	\N	136 Lê Thánh Tôn, Bến Thành, Quận 1, Thành phố Hồ Chí Minh	\N	10.7723000	106.6975000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.3	2025-05-27 17:21:52.281+07	2025-05-27 17:21:52.281+07
22	Đi bộ và ngắm cảnh đường phố Nguyễn Huệ	\N	\N	Nguyễn Huệ, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh	\N	10.7729000	106.7016000	/images/place-default.jpg	8:00 - 17:00	\N	\N	60	\N	4.5	2025-05-27 17:21:52.284+07	2025-05-27 17:21:52.284+07
24	Tham quan Chợ Bình Tây	\N	\N	57A Tháp Mười, Phường 2, Quận 6, Thành phố Hồ Chí Minh	\N	10.7503000	106.6619000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	120	\N	4.2	2025-05-27 17:21:52.29+07	2025-05-27 17:21:52.29+07
25	Tham quan Chùa Bà Thiên Hậu	\N	\N	710 Nguyễn Trãi, Phường 11, Quận 5, Thành phố Hồ Chí Minh	\N	10.7525000	106.6672000	/images/place-default.jpg	8:00 - 17:00	\N	\N	90	\N	4.5	2025-05-27 17:21:52.293+07	2025-05-27 17:21:52.293+07
26	Ăn trưa Dimsum tại Sủi Cảo Hà Tôn Quyền	\N	\N	500 Hà Tôn Quyền, Phường 7, Quận 11, Thành phố Hồ Chí Minh	\N	10.7628000	106.6531000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.3	2025-05-27 17:21:52.295+07	2025-05-27 17:21:52.295+07
27	Khám phá các con hẻm ẩm thực Chợ Lớn	\N	\N	Các con hẻm xung quanh đường Châu Văn Liêm, Quận 5, Thành phố Hồ Chí Minh	\N	10.7539000	106.6686000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	120	\N	4.6	2025-05-27 17:21:52.298+07	2025-05-27 17:21:52.298+07
29	Ăn tối tại Lẩu Dê 404	\N	\N	36B Trần Quang Khải, Tân Định, Quận 1, Thành phố Hồ Chí Minh	\N	10.7927000	106.6928000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.4	2025-05-27 17:21:52.303+07	2025-05-27 17:21:52.303+07
32	Tham quan Bảo tàng Chứng tích Chiến tranh	\N	\N	28 Võ Văn Tần, Phường 6, Quận 3, Thành phố Hồ Chí Minh	\N	10.7751000	106.6843000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.5	2025-05-27 17:21:52.312+07	2025-05-27 17:21:52.312+07
33	Tham quan Bảo tàng Mỹ thuật Thành phố Hồ Chí Minh	\N	\N	97A Phó Đức Chính, Nguyễn Thái Bình, Quận 1, Thành phố Hồ Chí Minh	\N	10.7705000	106.7023000	/images/place-default.jpg	8:00 - 17:00	\N	\N	90	\N	4.3	2025-05-27 17:21:52.315+07	2025-05-27 17:21:52.315+07
34	Ăn trưa Bún Bò Huế tại Bún Bò Gánh	\N	\N	110 Lý Chính Thắng, Võ Thị Sáu, Quận 3, Thành phố Hồ Chí Minh	\N	10.7885000	106.6819000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.4	2025-05-27 17:21:52.318+07	2025-05-27 17:21:52.318+07
35	Mua sắm tại Takashimaya	\N	\N	65 Lê Lợi, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh	\N	10.7708000	106.7001000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	120	\N	4.5	2025-05-27 17:21:52.32+07	2025-05-27 17:21:52.32+07
36	Uống nước ép trái cây tại Sinh Tố 142	\N	\N	142 Nguyễn Cư Trinh, Nguyễn Cư Trinh, Quận 1, Thành phố Hồ Chí Minh	\N	10.7654000	106.6866000	/images/cafe-default.jpg	7:00 - 22:00	\N	\N	60	\N	4.2	2025-05-27 17:21:52.323+07	2025-05-27 17:21:52.323+07
31	Ăn sáng Cơm Tấm Ba Ghiền	\N	\N	84 Đặng Văn Bi, Bình Thọ, Thủ Đức, Thành phố Hồ Chí Minh	\N	10.8541000	106.7561000	/images/ha-noi.jpg	11:00 - 22:00	\N	\N	60	\N	4.6	2025-05-27 17:21:52.31+07	2025-05-29 16:45:19.494+07
23	Ăn sáng Hủ Tiếu Nam Vang	\N	\N	A65-A66 Nguyễn Trãi, Phường 2, Quận 5, Thành phố Hồ Chí Minh	\N	10.7533000	106.6723000	/images/ha-noi.jpg	11:00 - 22:00	\N	\N	60	\N	4.4	2025-05-27 17:21:52.288+07	2025-05-29 16:45:31.597+07
28	Uống trà sữa tại Gong Cha	\N	2	Nhiều chi nhánh tại Sài Gòn	\N	10.7747000	106.6973000	/images/cafe-default.jpg	7:00 - 22:00	\N	\N	60	mid	4.1	2025-05-27 17:21:52.3+07	2025-05-30 07:54:20.42+07
30	Thưởng thức bia thủ công tại Pasteur Street Brewing Company	\N	\N	144 Pasteur, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh	\N	10.7759000	106.7031000	/images/pasteurstreet-banner-04.jpg	11:00 - 22:00	\N	\N	90	\N	4.7	2025-05-27 17:21:52.305+07	2025-05-29 18:44:04.757+07
20	Uống cà phê tại The Workshop Coffee	\N	\N	27 Ngô Đức Kế, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh	\N	10.7739000	106.7018000	/images/the-workshop-cafe.jpg	7:00 - 22:00	\N	\N	90	\N	4.7	2025-05-27 17:21:52.278+07	2025-05-29 18:45:46.341+07
37	Ăn tối tại Quán Ụt Ụt	\N	\N	168 Võ Văn Tần, Phường 5, Quận 3, Thành phố Hồ Chí Minh	\N	10.7752000	106.6859000	/images/webpnet-compress-image-32.jpg	11:00 - 22:00	\N	\N	90	\N	4.6	2025-05-27 17:21:52.326+07	2025-05-29 18:46:59.071+07
38	Ăn sáng tại Chợ Đồng Xoài	\N	\N	Đường Trần Hưng Đạo, Phường Tân Phú, Đồng Xoài, Bình Phước	\N	11.5397000	106.8906000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.0	2025-05-28 09:28:37.471+07	2025-05-28 09:28:37.471+07
39	Tham quan Tượng Đài Chiến Thắng Đồng Xoài	\N	\N	Phường Tân Phú, Đồng Xoài, Bình Phước	\N	11.5403000	106.8855000	/images/place-default.jpg	8:00 - 17:00	\N	\N	90	\N	4.2	2025-05-28 09:28:37.574+07	2025-05-28 09:28:37.574+07
40	Ăn trưa tại Nhà hàng địa phương	\N	\N	QL14, Tân Phú, Đồng Xoài, Bình Phước	\N	11.5345000	106.8867000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.3	2025-05-28 09:28:37.579+07	2025-05-28 09:28:37.579+07
41	Tham quan Bảo Tàng Bình Phước	\N	\N	Đường Trần Phú, Phường Tân Phú, Đồng Xoài, Bình Phước	\N	11.5358000	106.8857000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.5	2025-05-28 09:28:37.584+07	2025-05-28 09:28:37.584+07
42	Cafe tại quán địa phương	\N	\N	Đường Phú Riềng Đỏ, Phường Tân Xuân, Đồng Xoài, Bình Phước	\N	11.5473000	106.8886000	/images/cafe-default.jpg	7:00 - 22:00	\N	\N	60	\N	4.0	2025-05-28 09:28:37.593+07	2025-05-28 09:28:37.593+07
43	Ăn tối tại Nhà hàng	\N	\N	QL14, Tân Phú, Đồng Xoài, Bình Phước	\N	11.5362000	106.8865000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.2	2025-05-28 09:28:37.602+07	2025-05-28 09:28:37.602+07
46	Ăn trưa tại Vườn Quốc Gia (mang theo)	\N	\N	Xã Bù Gia Mập, Bù Gia Mập, Bình Phước	\N	12.5833000	107.3500000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.0	2025-05-28 09:28:37.628+07	2025-05-28 09:28:37.628+07
47	Di chuyển về Đồng Xoài	\N	\N	Đồng Xoài, Bình Phước	\N	11.5397000	106.8906000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.0	2025-05-28 09:28:37.636+07	2025-05-28 09:28:37.636+07
48	Ăn tối tại Đồng Xoài	\N	\N	Đường Phú Riềng Đỏ, Phường Tân Xuân, Đồng Xoài, Bình Phước	\N	11.5455000	106.8892000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.3	2025-05-28 09:28:37.644+07	2025-05-28 09:28:37.644+07
49	Ăn sáng tại quán địa phương	\N	\N	Đường Trần Hưng Đạo, Phường Tân Phú, Đồng Xoài, Bình Phước	\N	11.5397000	106.8906000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.0	2025-05-28 09:28:37.653+07	2025-05-28 09:28:37.653+07
50	Mua sắm đặc sản Bình Phước	\N	\N	Đường Trần Hưng Đạo, Phường Tân Phú, Đồng Xoài, Bình Phước	\N	11.5397000	106.8906000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	120	\N	4.2	2025-05-28 09:28:37.661+07	2025-05-28 09:28:37.661+07
51	Ăn trưa	\N	\N	Đường Trần Hưng Đạo, Phường Tân Phú, Đồng Xoài, Bình Phước	\N	11.5397000	106.8906000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.1	2025-05-28 09:28:37.671+07	2025-05-28 09:28:37.671+07
52	Kết thúc chuyến đi	\N	\N	Đồng Xoài, Bình Phước	\N	11.5397000	106.8906000	/images/place-default.jpg	8:00 - 17:00	\N	\N	60	\N	4.0	2025-05-28 09:28:37.677+07	2025-05-28 09:28:37.677+07
67	Karaoke tại Queen Karaoke	\N	\N	22 Nguyễn Đăng Đạo, Suối Hoa, Bắc Ninh	\N	21.1943000	106.0771000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	180	\N	4.0	2025-05-29 18:55:39.83+07	2025-05-29 18:55:39.83+07
68	Ăn tối tại Nhà hàng Phương Nam	\N	\N	Khu đô thị Vạn An, Phường Yên Hòa, Thành phố Bắc Ninh, Bắc Ninh	\N	21.1833000	106.0765000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.3	2025-05-29 18:55:39.832+07	2025-05-29 18:55:39.832+07
15	Ăn sáng Bánh Mì Huỳnh Hoa	\N	\N	26 Lê Thị Riêng, Bến Thành, Quận 1, Thành phố Hồ Chí Minh	\N	10.7702000	106.6945000	/images/ha-noi.jpg	11:00 - 22:00	\N	\N	60	\N	4.5	2025-05-27 17:21:52.249+07	2025-05-29 16:45:15.352+07
44	Ăn sáng	2	\N	Xã Bù Gia Mập, Bù Gia Mập, Bình Phước	\N	12.5667000	107.3333000	/images/ha-noi.jpg	11:00 - 22:00	\N	\N	60	luxury	3.8	2025-05-28 09:28:37.612+07	2025-05-29 18:40:50.438+07
45	Tham quan Vườn Quốc Gia Bù Gia Mập	\N	\N	Xã Bù Gia Mập, Bù Gia Mập, Bình Phước	\N	12.5833000	107.3500000	/images/vuon-quoc-gia-bu-gia-map.jpg	8:00 - 17:00	\N	\N	240	\N	4.6	2025-05-28 09:28:37.621+07	2025-05-29 18:46:25.369+07
53	Đến Thái Nguyên và nhận phòng khách sạn	\N	\N	Số 8, đường Hoàng Văn Thụ, TP. Thái Nguyên, Thái Nguyên	\N	21.5883000	105.8508000	/images/hotel-default.jpg	24/7	\N	\N	60	\N	4.2	2025-05-29 18:50:44.083+07	2025-05-29 18:50:44.083+07
54	Tham quan Bảo tàng Văn hóa các dân tộc Việt Nam	\N	\N	Đường Đội Cấn, TP. Thái Nguyên, Thái Nguyên	\N	21.5864000	105.8424000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.5	2025-05-29 18:50:44.09+07	2025-05-29 18:50:44.09+07
55	Ăn trưa tại Nhà hàng Lẩu Đức Anh	\N	\N	Số 16, đường Hoàng Văn Thụ, TP. Thái Nguyên, Thái Nguyên	\N	21.5886000	105.8522000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.0	2025-05-29 18:50:44.094+07	2025-05-29 18:50:44.094+07
56	Tham quan Hồ Núi Cốc	\N	\N	Xã Tân Thái, Huyện Đại Từ, Thái Nguyên	\N	21.5103000	105.7373000	/images/place-default.jpg	8:00 - 17:00	\N	\N	180	\N	4.3	2025-05-29 18:50:44.099+07	2025-05-29 18:50:44.099+07
57	Massage thư giãn	\N	\N	Số 123, Đường Thống Nhất, TP. Thái Nguyên, Thái Nguyên	\N	21.5901000	105.8487000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	90	\N	4.6	2025-05-29 18:50:44.102+07	2025-05-29 18:50:44.102+07
58	Ăn tối và vui chơi giải trí	\N	\N	Số 456, Đường Phan Đình Phùng, TP. Thái Nguyên, Thái Nguyên	\N	21.5925000	105.8541000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	120	\N	4.1	2025-05-29 18:50:44.106+07	2025-05-29 18:50:44.106+07
59	Ăn sáng tại Khách sạn	\N	\N	Số 8, đường Hoàng Văn Thụ, TP. Thái Nguyên, Thái Nguyên	\N	21.5883000	105.8508000	/images/hotel-default.jpg	24/7	\N	\N	60	\N	4.2	2025-05-29 18:50:44.111+07	2025-05-29 18:50:44.111+07
60	Tham quan Đồi chè Tân Cương	\N	\N	Xã Tân Cương, TP. Thái Nguyên, Thái Nguyên	\N	21.5417000	105.8042000	/images/place-default.jpg	8:00 - 17:00	\N	\N	180	\N	4.7	2025-05-29 18:50:44.115+07	2025-05-29 18:50:44.115+07
61	Mua sắm đặc sản Thái Nguyên	\N	\N	Đường Hoàng Hoa Thám, TP. Thái Nguyên, Thái Nguyên	\N	21.5904000	105.8456000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	90	\N	4.0	2025-05-29 18:50:44.12+07	2025-05-29 18:50:44.12+07
62	Ăn trưa tại Nhà hàng Gà Mạnh Hoạch	\N	\N	Số 789, Đường Cách Mạng Tháng Tám, TP. Thái Nguyên, Thái Nguyên	\N	21.5852000	105.8479000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.4	2025-05-29 18:50:44.124+07	2025-05-29 18:50:44.124+07
63	Trả phòng khách sạn và di chuyển về	\N	\N	Số 8, đường Hoàng Văn Thụ, TP. Thái Nguyên, Thái Nguyên	\N	21.5883000	105.8508000	/images/hotel-default.jpg	24/7	\N	\N	60	\N	4.2	2025-05-29 18:50:44.127+07	2025-05-29 18:50:44.127+07
64	Tham quan Chùa Bút Tháp	\N	\N	xã Đình Tổ, huyện Thuận Thành, Bắc Ninh	\N	21.0358000	106.0453000	/images/place-default.jpg	8:00 - 17:00	\N	\N	180	\N	4.7	2025-05-29 18:55:39.803+07	2025-05-29 18:55:39.803+07
65	Ăn trưa tại Nhà hàng Ẩm Thực Đồng Quê	\N	\N	Đường Bình Than, Đại Đồng, Từ Sơn, Bắc Ninh	\N	21.1589000	106.0017000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.2	2025-05-29 18:55:39.823+07	2025-05-29 18:55:39.823+07
66	Tham quan Làng gốm Phù Lãng	\N	\N	Xã Phù Lãng, Huyện Quế Võ, Bắc Ninh	\N	21.2292000	106.1714000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.5	2025-05-29 18:55:39.827+07	2025-05-29 18:55:39.827+07
69	Tham quan Đền Đô	\N	\N	xã Đình Bảng, Từ Sơn, Bắc Ninh	\N	21.1486000	106.0189000	/images/place-default.jpg	8:00 - 17:00	\N	\N	150	\N	4.6	2025-05-29 18:55:39.838+07	2025-05-29 18:55:39.838+07
70	Ăn trưa tại Nhà hàng Cơm Niêu	\N	\N	Đường Trần Phú, Đông Ngàn, Từ Sơn, Bắc Ninh	\N	21.1532000	105.9987000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	75	\N	4.1	2025-05-29 18:55:39.842+07	2025-05-29 18:55:39.842+07
71	Thư giãn tại Khách sạn Mường Thanh Grand Bắc Ninh	\N	\N	Khu đô thị Hudland, đường Lê Thái Tổ, phường Võ Cường, Bắc Ninh	\N	21.1917000	106.0667000	/images/hotel-default.jpg	24/7	\N	\N	240	\N	4.4	2025-05-29 18:55:39.846+07	2025-05-29 18:55:39.846+07
72	Xem biểu diễn Quan họ trên thuyền	\N	\N	Đình Bảng, Từ Sơn, Bắc Ninh	\N	21.1512000	106.0213000	/images/place-default.jpg	8:00 - 17:00	\N	\N	90	\N	4.8	2025-05-29 18:55:39.849+07	2025-05-29 18:55:39.849+07
73	Ăn tối tại Nhà hàng Tre Vàng	\N	\N	Số 12, Đường Nguyễn Gia Thiều, P. Suối Hoa, Tp. Bắc Ninh, Bắc Ninh	\N	21.1962000	106.0751000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	75	\N	4.5	2025-05-29 18:55:39.853+07	2025-05-29 18:55:39.853+07
74	Tham quan và mua sắm tại Chợ Nhớ	\N	\N	Đường Thiên Đức, Vệ An, Bắc Ninh	\N	21.2011000	106.0711000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	120	\N	4.3	2025-05-29 18:55:39.858+07	2025-05-29 18:55:39.858+07
75	Ăn trưa tại Quán Bún Ốc Cô Huê	\N	\N	Số 11 Hàn Thuyên, P. Suối Hoa, Tp. Bắc Ninh, Bắc Ninh	\N	21.1965000	106.0743000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.6	2025-05-29 18:55:39.86+07	2025-05-29 18:55:39.86+07
76	Uống cà phê tại Cafe Cộng	\N	\N	Số 33 Nguyễn Đăng Đạo, Suối Hoa, Bắc Ninh	\N	21.1945000	106.0764000	/images/cafe-default.jpg	7:00 - 22:00	\N	\N	75	\N	4.4	2025-05-29 18:55:39.863+07	2025-05-29 18:55:39.863+07
77	Ăn sáng bún đậu mắm tôm	\N	1	31 Ngõ Trạm, Hàng Bông, Hoàn Kiếm, Hà Nội	\N	21.0282000	105.8467000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.2	2025-05-30 23:19:00.823+07	2025-05-30 23:19:00.823+07
78	Tham quan Hồ Tây và chùa Trấn Quốc	\N	1	Đường Thanh Niên, Yên Phụ, Ba Đình, Hà Nội	\N	21.0498000	105.8353000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.5	2025-05-30 23:19:00.933+07	2025-05-30 23:19:00.933+07
79	Đi dạo quanh Hồ Tây	\N	1	Tây Hồ, Hà Nội	\N	21.0564000	105.8246000	/images/place-default.jpg	8:00 - 17:00	\N	\N	60	\N	4.6	2025-05-30 23:19:00.942+07	2025-05-30 23:19:00.942+07
80	Ăn trưa tại nhà hàng bún chả	\N	1	24 Lê Văn Hưu, Phan Chu Trinh, Hai Bà Trưng, Hà Nội	\N	21.0247000	105.8546000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	75	\N	4.4	2025-05-30 23:19:00.95+07	2025-05-30 23:19:00.95+07
81	Tham quan Văn Miếu - Quốc Tử Giám	\N	1	58 Quốc Tử Giám, Đống Đa, Hà Nội	\N	21.0261000	105.8351000	/images/place-default.jpg	8:00 - 17:00	\N	\N	90	\N	4.5	2025-05-30 23:19:00.955+07	2025-05-30 23:19:00.955+07
82	Uống cà phê trứng	\N	1	39 Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội	\N	21.0352000	105.8544000	/images/cafe-default.jpg	7:00 - 22:00	\N	\N	60	\N	4.7	2025-05-30 23:19:00.96+07	2025-05-30 23:19:00.96+07
83	Xem múa rối nước	\N	1	57B Đinh Tiên Hoàng, Hàng Bạc, Hoàn Kiếm, Hà Nội	\N	21.0323000	105.8529000	/images/place-default.jpg	8:00 - 17:00	\N	\N	60	\N	4.4	2025-05-30 23:19:00.963+07	2025-05-30 23:19:00.963+07
84	Ăn tối tại phố Tạ Hiện	\N	1	Tạ Hiện, Hàng Buồm, Hoàn Kiếm, Hà Nội	\N	21.0365000	105.8504000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.3	2025-05-30 23:19:00.967+07	2025-05-30 23:19:00.967+07
85	Ăn sáng phở	\N	1	10 Lý Quốc Sư, Hàng Trống, Hoàn Kiếm, Hà Nội	\N	21.0296000	105.8479000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.6	2025-05-30 23:19:00.972+07	2025-05-30 23:19:00.972+07
86	Tham quan Lăng Chủ tịch Hồ Chí Minh	\N	1	2 Hùng Vương, Điện Biên, Ba Đình, Hà Nội	\N	21.0364000	105.8321000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.7	2025-05-30 23:19:00.976+07	2025-05-30 23:19:00.976+07
87	Tham quan Bảo tàng Hồ Chí Minh	\N	1	19 Ngọc Hà, Ba Đình, Hà Nội	\N	21.0383000	105.8335000	/images/place-default.jpg	8:00 - 17:00	\N	\N	90	\N	4.5	2025-05-30 23:19:00.98+07	2025-05-30 23:19:00.98+07
88	Ăn trưa bún riêu cua	\N	1	19 Hàng Lược, Hàng Mã, Hoàn Kiếm, Hà Nội	\N	21.0378000	105.8485000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	75	\N	4.3	2025-05-30 23:19:00.984+07	2025-05-30 23:19:00.984+07
89	Tham quan Hoàng thành Thăng Long	\N	1	19C Hoàng Diệu, Điện Biên, Ba Đình, Hà Nội	\N	21.0389000	105.8394000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.6	2025-05-30 23:19:00.988+07	2025-05-30 23:19:00.988+07
90	Mua sắm quà lưu niệm tại phố Hàng Gai	\N	1	Hàng Gai, Hoàn Kiếm, Hà Nội	\N	21.0342000	105.8516000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	90	\N	4.2	2025-05-30 23:19:00.992+07	2025-05-30 23:19:00.992+07
91	Ăn tối tại nhà hàng nem nướng	\N	1	39 Ấu Triệu, Hàng Trống, Hoàn Kiếm, Hà Nội	\N	21.0286000	105.8495000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.4	2025-05-30 23:19:00.996+07	2025-05-30 23:19:00.996+07
92	Ăn sáng bánh cuốn	\N	1	26B Thụy Khuê, Tây Hồ, Hà Nội	\N	21.0573000	105.8286000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.5	2025-05-30 23:19:01.004+07	2025-05-30 23:19:01.004+07
93	Tham quan chợ Đồng Xuân	\N	1	Đồng Xuân, Hoàn Kiếm, Hà Nội	\N	21.0393000	105.8506000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	120	\N	4.0	2025-05-30 23:19:01.009+07	2025-05-30 23:19:01.009+07
94	Ăn trưa tại quán cơm bình dân	\N	1	23 Trần Nhật Duật, Hoàn Kiếm, Hà Nội	\N	21.0383000	105.8519000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	75	\N	4.1	2025-05-30 23:19:01.013+07	2025-05-30 23:19:01.013+07
95	Mua sắm tại Vincom Center Bà Triệu	\N	1	191 Bà Triệu, Lê Đại Hành, Hai Bà Trưng, Hà Nội	\N	21.0178000	105.8485000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	120	\N	4.3	2025-05-30 23:19:01.017+07	2025-05-30 23:19:01.017+07
96	Uống trà chanh vỉa hè	\N	1	Nhà thờ Lớn Hà Nội, Nhà Chung, Hoàn Kiếm, Hà Nội	\N	21.0309000	105.8515000	/images/cafe-default.jpg	7:00 - 22:00	\N	\N	60	\N	4.2	2025-05-30 23:19:01.02+07	2025-05-30 23:19:01.02+07
97	Ăn sáng tại Phở Bát Đàn	\N	1	49 Bát Đàn, Cửa Đông, Hoàn Kiếm, Hà Nội	\N	21.0342000	105.8486000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.2	2025-05-31 23:28:31.993+07	2025-05-31 23:28:31.993+07
98	Tham quan Hồ Hoàn Kiếm và Đền Ngọc Sơn	\N	1	Hoàn Kiếm, Hà Nội	\N	21.0285000	105.8542000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.5	2025-05-31 23:28:32.116+07	2025-05-31 23:28:32.116+07
99	Mua sắm tại Chợ Đồng Xuân	\N	1	Đồng Xuân, Hoàn Kiếm, Hà Nội	\N	21.0372000	105.8508000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	90	\N	4.0	2025-05-31 23:28:32.135+07	2025-05-31 23:28:32.135+07
100	Ăn trưa tại Bún Chả Hương Liên	\N	1	24 Lê Văn Hưu, Phạm Đình Hồ, Hai Bà Trưng, Hà Nội	\N	21.0248000	105.8576000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.4	2025-05-31 23:28:32.154+07	2025-05-31 23:28:32.154+07
101	Đi xích lô quanh khu phố cổ	\N	1	Hoàn Kiếm, Hà Nội	\N	21.0320000	105.8520000	/images/place-default.jpg	8:00 - 17:00	\N	\N	60	\N	4.3	2025-05-31 23:28:32.171+07	2025-05-31 23:28:32.171+07
102	Uống cà phê trứng tại Cafe Giảng	\N	1	39 Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội	\N	21.0351000	105.8536000	/images/cafe-default.jpg	7:00 - 22:00	\N	\N	60	\N	4.6	2025-05-31 23:28:32.188+07	2025-05-31 23:28:32.188+07
103	Ăn tối tại Nhà hàng Chim Sáo	\N	1	65 Quán Sứ, Hoàn Kiếm, Hà Nội	\N	21.0293000	105.8469000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.4	2025-05-31 23:28:32.204+07	2025-05-31 23:28:32.204+07
104	Ăn sáng tại Bánh cuốn Thanh Trì	\N	1	30 Tô Hiến Thành, Bùi Thị Xuân, Hai Bà Trưng, Hà Nội	\N	21.0159000	105.8588000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.3	2025-05-31 23:28:32.224+07	2025-05-31 23:28:32.224+07
105	Tham quan Văn Miếu - Quốc Tử Giám	\N	1	58 Quốc Tử Giám, Đống Đa, Hà Nội	\N	21.0260000	105.8378000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.5	2025-05-31 23:28:32.24+07	2025-05-31 23:28:32.24+07
106	Tham quan Lăng Chủ tịch Hồ Chí Minh	\N	1	2 Hùng Vương, Điện Biên, Ba Đình, Hà Nội	\N	21.0364000	105.8322000	/images/place-default.jpg	8:00 - 17:00	\N	\N	90	\N	4.6	2025-05-31 23:28:32.26+07	2025-05-31 23:28:32.26+07
107	Ăn trưa tại Quán Nem	\N	1	58 Hàng Bông, Hoàn Kiếm, Hà Nội	\N	21.0324000	105.8475000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.3	2025-05-31 23:28:32.275+07	2025-05-31 23:28:32.275+07
108	Tham quan Bảo tàng Dân tộc học Việt Nam	\N	1	Nguyễn Văn Huyên, Quan Hoa, Cầu Giấy, Hà Nội	\N	21.0380000	105.7960000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.7	2025-05-31 23:28:32.296+07	2025-05-31 23:28:32.296+07
109	Dạo bộ và mua sắm tại phố Hàng Gai	\N	1	Hàng Gai, Hoàn Kiếm, Hà Nội	\N	21.0332000	105.8514000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	90	\N	4.2	2025-05-31 23:28:32.314+07	2025-05-31 23:28:32.314+07
110	Ăn tối tại Nhà hàng Essence	\N	1	22 Ngõ Huyện, Hàng Gai, Hoàn Kiếm, Hà Nội	\N	21.0327000	105.8488000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.5	2025-05-31 23:28:32.329+07	2025-05-31 23:28:32.329+07
111	Ăn sáng tại Xôi Yến	\N	1	35B Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội	\N	21.0353000	105.8538000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.4	2025-05-31 23:28:32.351+07	2025-05-31 23:28:32.351+07
112	Tham quan Bảo tàng Mỹ thuật Việt Nam	\N	1	66 Nguyễn Thái Học, Ba Đình, Hà Nội	\N	21.0342000	105.8340000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.5	2025-05-31 23:28:32.371+07	2025-05-31 23:28:32.371+07
113	Mua sắm quà lưu niệm tại 36 phố phường	\N	1	Hoàn Kiếm, Hà Nội	\N	21.0330000	105.8500000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	90	\N	4.3	2025-05-31 23:28:32.391+07	2025-05-31 23:28:32.391+07
114	Ăn trưa tại Chả cá Lã Vọng	\N	1	14 Chả Cá, Hàng Bồ, Hoàn Kiếm, Hà Nội	\N	21.0346000	105.8478000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.6	2025-05-31 23:28:32.411+07	2025-05-31 23:28:32.411+07
115	Thưởng thức kem Tràng Tiền	\N	1	35 Tràng Tiền, Hoàn Kiếm, Hà Nội	\N	21.0278000	105.8564000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	45	\N	4.2	2025-05-31 23:28:32.429+07	2025-05-31 23:28:32.429+07
116	Massage chân thư giãn	\N	1	5/7 Đào Duy Từ, Hàng Buồm, Hoàn Kiếm, Hà Nội	\N	21.0361000	105.8475000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	60	\N	4.5	2025-05-31 23:28:32.464+07	2025-05-31 23:28:32.464+07
117	Ăn tối và ngắm cảnh Hồ Tây tại Nhà hàng Sen Tây Hồ	\N	1	614 Lạc Long Quân, Nhật Tân, Tây Hồ, Hà Nội	\N	21.0690000	105.8160000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.3	2025-05-31 23:28:32.482+07	2025-05-31 23:28:32.482+07
118	Ăn sáng tại Bún Chả Cá 109	1	5	109 Nguyễn Chí Thanh, Hải Châu 1, Hải Châu, Đà Nẵng	\N	16.0641000	108.2217000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.2	2025-06-01 09:34:43.954+07	2025-06-01 09:34:43.954+07
119	Tắm biển và thư giãn tại bãi biển Mỹ Khê	4	5	Đường Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng	\N	16.0545000	108.2443000	/images/place-default.jpg	8:00 - 17:00	\N	\N	180	\N	4.7	2025-06-01 09:34:44.058+07	2025-06-01 09:34:44.058+07
120	Ăn trưa tại Hải Sản Bé Mặn	1	5	Lô 11 Võ Nguyên Giáp, Mân Thái, Sơn Trà, Đà Nẵng	\N	16.0662000	108.2477000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.5	2025-06-01 09:34:44.064+07	2025-06-01 09:34:44.064+07
121	Tham quan Bảo tàng Chăm	4	5	Số 02 đường 2 Tháng 9, Bình Hiên, Hải Châu, Đà Nẵng	\N	16.0562000	108.2246000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.3	2025-06-01 09:34:44.071+07	2025-06-01 09:34:44.071+07
122	Thưởng thức cà phê tại Danang Souvenirs & Cafe	2	5	34 Bạch Đằng, Thạch Thang, Hải Châu, Đà Nẵng	\N	16.0671000	108.2232000	/images/cafe-default.jpg	7:00 - 22:00	\N	\N	90	\N	4.4	2025-06-01 09:34:44.077+07	2025-06-01 09:34:44.077+07
123	Ăn tối lãng mạn tại nhà hàng Waterfront	1	5	150 Bạch Đằng, Hải Châu 1, Hải Châu, Đà Nẵng	\N	16.0676000	108.2211000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.6	2025-06-01 09:34:44.082+07	2025-06-01 09:34:44.082+07
124	Đi dạo và ngắm Cầu Rồng phun lửa, phun nước	4	5	An Hải, Hải Châu, Đà Nẵng	\N	16.0621000	108.2303000	/images/place-default.jpg	8:00 - 17:00	\N	\N	60	\N	4.8	2025-06-01 09:34:44.088+07	2025-06-01 09:34:44.088+07
125	Di chuyển đến Bà Nà Hills	4	5	Thôn An Sơn, Hòa Ninh, Hòa Vang, Đà Nẵng	\N	16.0169000	108.0478000	/images/place-default.jpg	8:00 - 17:00	\N	\N	60	\N	4.0	2025-06-01 09:34:44.095+07	2025-06-01 09:34:44.095+07
126	Tham quan Bà Nà Hills và Cầu Vàng	4	5	Thôn An Sơn, Hòa Ninh, Hòa Vang, Đà Nẵng	\N	16.0169000	108.0478000	/images/place-default.jpg	8:00 - 17:00	\N	\N	300	\N	4.7	2025-06-01 09:34:44.1+07	2025-06-01 09:34:44.1+07
127	Ăn trưa tại nhà hàng trên Bà Nà Hills	1	5	Bà Nà Hills, Hòa Vang, Đà Nẵng	\N	16.0169000	108.0478000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.2	2025-06-01 09:34:44.104+07	2025-06-01 09:34:44.104+07
128	Vui chơi tại Fantasy Park	4	5	Bà Nà Hills, Hòa Vang, Đà Nẵng	\N	16.0169000	108.0478000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.5	2025-06-01 09:34:44.108+07	2025-06-01 09:34:44.108+07
129	Di chuyển về Đà Nẵng	4	5	Trung tâm Đà Nẵng	\N	16.0473000	108.2209000	/images/place-default.jpg	8:00 - 17:00	\N	\N	60	\N	4.0	2025-06-01 09:34:44.113+07	2025-06-01 09:34:44.113+07
130	Ăn tối tại Mì Quảng Bà Mua	1	5	19 Trần Bình Trọng, Hải Châu 1, Hải Châu, Đà Nẵng	\N	16.0638000	108.2226000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	75	\N	4.3	2025-06-01 09:34:44.118+07	2025-06-01 09:34:44.118+07
131	Đi dạo và ngắm cảnh sông Hàn về đêm	4	5	Đà Nẵng	\N	16.0655000	108.2255000	/images/place-default.jpg	8:00 - 17:00	\N	\N	60	\N	4.6	2025-06-01 09:34:44.123+07	2025-06-01 09:34:44.123+07
132	Ăn sáng tại bánh mì que	1	5	Địa chỉ ngẫu nhiên	\N	16.0621000	108.2203000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	45	\N	4.0	2025-06-01 09:34:44.129+07	2025-06-01 09:34:44.129+07
133	Tham quan chùa Linh Ứng Bãi Bụt	4	5	Hoàng Sa, Thọ Quang, Sơn Trà, Đà Nẵng	\N	16.0973000	108.2554000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.7	2025-06-01 09:34:44.133+07	2025-06-01 09:34:44.133+07
134	Khám phá Bán đảo Sơn Trà	4	5	Sơn Trà, Đà Nẵng	\N	16.1136000	108.2578000	/images/place-default.jpg	8:00 - 17:00	\N	\N	90	\N	4.5	2025-06-01 09:34:44.136+07	2025-06-01 09:34:44.136+07
135	Ăn trưa tại nhà hàng trên bán đảo Sơn Trà	1	5	Sơn Trà, Đà Nẵng	\N	16.1136000	108.2578000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.2	2025-06-01 09:34:44.14+07	2025-06-01 09:34:44.14+07
136	Mua sắm quà lưu niệm tại Chợ Hàn	5	5	119 Trần Phú, Hải Châu 1, Hải Châu, Đà Nẵng	\N	16.0702000	108.2238000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	120	\N	4.3	2025-06-01 09:34:44.144+07	2025-06-01 09:34:44.144+07
137	Thưởng thức kem bơ	2	5	Địa chỉ ngẫu nhiên	\N	16.0621000	108.2203000	/images/cafe-default.jpg	7:00 - 22:00	\N	\N	60	\N	4.5	2025-06-01 09:34:44.148+07	2025-06-01 09:34:44.148+07
138	Ăn tối tại nhà hàng Làng Cá	1	5	178/1 Trần Hưng Đạo, Nại Hiên Đông, Sơn Trà, Đà Nẵng	\N	16.0652000	108.2407000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.4	2025-06-01 09:34:44.152+07	2025-06-01 09:34:44.152+07
139	Ăn sáng tại Bún Chả Cá 109	1	5	109 Nguyễn Chí Thanh, Hải Châu 1, Hải Châu, Đà Nẵng	\N	16.0654000	108.2206000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.2	2025-06-01 10:05:51.482+07	2025-06-01 10:05:51.482+07
140	Tắm biển Mỹ Khê	4	5	Đường Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng	\N	16.0545000	108.2445000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.7	2025-06-01 10:05:51.524+07	2025-06-01 10:05:51.524+07
141	Tham quan Ngũ Hành Sơn	4	5	81 Huyền Trân Công Chúa, Hoà Hải, Ngũ Hành Sơn, Đà Nẵng	\N	15.9768000	108.2568000	/images/place-default.jpg	8:00 - 17:00	\N	\N	180	\N	4.5	2025-06-01 10:05:51.533+07	2025-06-01 10:05:51.533+07
142	Ăn trưa tại Nhà hàng Bé Mặn	1	5	Lô 14 Hoàng Sa, Mân Thái, Sơn Trà, Đà Nẵng	\N	16.0727000	108.2478000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.3	2025-06-01 10:05:51.54+07	2025-06-01 10:05:51.54+07
143	Tham quan Làng đá mỹ nghệ Non Nước	5	5	82 Lê Văn Hiến, Hoà Hải, Ngũ Hành Sơn, Đà Nẵng	\N	15.9733000	108.2533000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	90	\N	4.0	2025-06-01 10:05:51.548+07	2025-06-01 10:05:51.548+07
144	Ăn tối và ngắm Cầu Rồng phun lửa	1	5	150 Bạch Đằng, Hải Châu 1, Hải Châu, Đà Nẵng	\N	16.0651000	108.2275000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.4	2025-06-01 10:05:51.556+07	2025-06-01 10:05:51.556+07
145	Di chuyển đến Bà Nà Hills	4	5	An Sơn, Hoà Ninh, Hòa Vang, Đà Nẵng	\N	16.0383000	108.0406000	/images/place-default.jpg	8:00 - 17:00	\N	\N	60	\N	4.8	2025-06-01 10:05:51.566+07	2025-06-01 10:05:51.566+07
146	Tham quan Bà Nà Hills	4	5	An Sơn, Hoà Ninh, Hòa Vang, Đà Nẵng	\N	16.0383000	108.0406000	/images/place-default.jpg	8:00 - 17:00	\N	\N	360	\N	4.8	2025-06-01 10:05:51.571+07	2025-06-01 10:05:51.571+07
147	Ăn trưa tại nhà hàng trên Bà Nà Hills	1	5	Bà Nà Hills, An Sơn, Hoà Ninh, Hòa Vang, Đà Nẵng	\N	16.0383000	108.0406000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.2	2025-06-01 10:05:51.576+07	2025-06-01 10:05:51.576+07
148	Trở về Đà Nẵng	4	5	Trung tâm Đà Nẵng	\N	16.0479000	108.2209000	/images/place-default.jpg	8:00 - 17:00	\N	\N	60	\N	4.8	2025-06-01 10:05:51.584+07	2025-06-01 10:05:51.584+07
149	Ăn tối tại Mỳ Quảng Ếch Bếp Trang	1	5	441 Ông Ích Khiêm, Hải Châu 2, Hải Châu, Đà Nẵng	\N	16.0556000	108.2158000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.5	2025-06-01 10:05:51.589+07	2025-06-01 10:05:51.589+07
150	Ăn sáng tại quán bánh mì	1	5	62 Trưng Nữ Vương, Bình Hiên, Hải Châu, Đà Nẵng	\N	16.0626000	108.2226000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.3	2025-06-01 10:05:51.598+07	2025-06-01 10:05:51.598+07
151	Tham quan Bảo tàng Chăm	4	5	Số 02 đường 2 Tháng 9, Bình Hiên, Hải Châu, Đà Nẵng	\N	16.0588000	108.2264000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.4	2025-06-01 10:05:51.604+07	2025-06-01 10:05:51.604+07
152	Mua sắm tại Chợ Hàn	5	5	119 Trần Phú, Hải Châu 1, Hải Châu, Đà Nẵng	\N	16.0654000	108.2239000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	120	\N	4.1	2025-06-01 10:05:51.61+07	2025-06-01 10:05:51.61+07
153	Ăn trưa tại Bún Mắm Nêm Vân	1	5	K23/14 Trần Kế Xương, Hải Châu 2, Hải Châu, Đà Nẵng	\N	16.0583000	108.2144000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.6	2025-06-01 10:05:51.617+07	2025-06-01 10:05:51.617+07
154	Uống cà phê tại The Coffee House	2	5	98 Bạch Đằng, Hải Châu 1, Hải Châu, Đà Nẵng	\N	16.0638000	108.2271000	/images/cafe-default.jpg	7:00 - 22:00	\N	\N	60	\N	4.2	2025-06-01 10:05:51.623+07	2025-06-01 10:05:51.623+07
155	Di chuyển ra sân bay	4	5	Đường Duy Tân, Hòa Thuận Tây, Hải Châu, Đà Nẵng	\N	16.0431000	108.1996000	/images/place-default.jpg	8:00 - 17:00	\N	\N	60	\N	4.0	2025-06-01 10:05:51.631+07	2025-06-01 10:05:51.631+07
156	Ăn sáng tại Ninh Bình	1	6	Số 17, đường Trần Hưng Đạo, phường Nam Bình, Ninh Bình	\N	20.2565000	105.9705000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.2	2025-06-04 22:02:38.983+07	2025-06-04 22:02:38.983+07
157	Tham quan Cố đô Hoa Lư	4	6	Trường Yên, Hoa Lư, Ninh Bình	\N	20.2500000	105.9500000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.3	2025-06-04 22:02:39.176+07	2025-06-04 22:02:39.176+07
158	Đi thuyền tham quan Tam Cốc	4	6	Xã Ninh Hải, Hoa Lư, Ninh Bình	\N	20.2333000	105.9667000	/images/place-default.jpg	8:00 - 17:00	\N	\N	150	\N	4.7	2025-06-04 22:02:39.181+07	2025-06-04 22:02:39.181+07
159	Ăn trưa tại nhà hàng địa phương ở Tam Cốc	1	6	Đường vào Tam Cốc, Ninh Hải, Hoa Lư, Ninh Bình	\N	20.2330000	105.9680000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.4	2025-06-04 22:02:39.186+07	2025-06-04 22:02:39.186+07
160	Tham quan chùa Bích Động	4	6	Xã Ninh Hải, Hoa Lư, Ninh Bình	\N	20.2317000	105.9700000	/images/place-default.jpg	8:00 - 17:00	\N	\N	90	\N	4.5	2025-06-04 22:02:39.195+07	2025-06-04 22:02:39.195+07
161	Nghỉ ngơi và thưởng thức cafe	2	6	Thôn Văn Lâm, Xã Ninh Hải, Hoa Lư, Ninh Bình	\N	20.2345000	105.9712000	/images/cafe-default.jpg	7:00 - 22:00	\N	\N	60	\N	4.6	2025-06-04 22:02:39.2+07	2025-06-04 22:02:39.2+07
162	Ăn tối tại nhà hàng dê núi	1	6	Đường Tràng An, xã Trường Yên, Hoa Lư, Ninh Bình	\N	20.2467000	105.9533000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.5	2025-06-04 22:02:39.21+07	2025-06-04 22:02:39.21+07
163	Ăn sáng tại khách sạn/nhà nghỉ	3	6	Địa chỉ khách sạn/nhà nghỉ bạn chọn	\N	20.2500000	105.9700000	/images/hotel-default.jpg	24/7	\N	\N	60	\N	4.0	2025-06-04 22:02:39.217+07	2025-06-04 22:02:39.217+07
164	Đi thuyền tham quan Tràng An	4	6	Xã Trường Yên, Hoa Lư, Ninh Bình	\N	20.2400000	105.9333000	/images/place-default.jpg	8:00 - 17:00	\N	\N	180	\N	4.8	2025-06-04 22:02:39.223+07	2025-06-04 22:02:39.223+07
165	Ăn trưa tại nhà hàng gần Tràng An	1	6	Khu du lịch Tràng An, xã Trường Yên, Hoa Lư, Ninh Bình	\N	20.2410000	105.9350000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.3	2025-06-04 22:02:39.228+07	2025-06-04 22:02:39.228+07
166	Tham quan chùa Bái Đính	4	6	Gia Sinh, Gia Viễn, Ninh Bình	\N	20.1833000	105.9500000	/images/place-default.jpg	8:00 - 17:00	\N	\N	150	\N	4.6	2025-06-04 22:02:39.232+07	2025-06-04 22:02:39.232+07
167	Mua sắm quà lưu niệm	5	6	Đường Trần Hưng Đạo, phường Nam Bình, Ninh Bình	\N	20.2550000	105.9720000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	90	\N	4.0	2025-06-04 22:02:39.237+07	2025-06-04 22:02:39.237+07
168	Ăn tối và kết thúc chuyến đi	1	6	Số 86, đường Trần Phú, phường Nam Thành, Ninh Bình	\N	20.2600000	105.9680000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.2	2025-06-04 22:02:39.243+07	2025-06-04 22:02:39.243+07
169	Ăn sáng Bún bò Huế	1	7	09 Nguyễn Du, Thành phố Huế, Thừa Thiên Huế	\N	16.4683000	107.5981000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.2	2025-06-04 22:07:19.228+07	2025-06-04 22:07:19.228+07
170	Tham quan Đại Nội Huế	4	7	Đoàn Thị Điểm, Thành phố Huế, Thừa Thiên Huế	\N	16.4750000	107.5867000	/images/place-default.jpg	8:00 - 17:00	\N	\N	180	\N	4.6	2025-06-04 22:07:19.263+07	2025-06-04 22:07:19.263+07
171	Tham quan Bảo tàng Cổ vật Cung đình Huế	4	7	03 Lê Trực, Phú Hậu, Thành phố Huế, Thừa Thiên Huế	\N	16.4772000	107.5834000	/images/place-default.jpg	8:00 - 17:00	\N	\N	90	\N	4.3	2025-06-04 22:07:19.269+07	2025-06-04 22:07:19.269+07
172	Ăn trưa Cơm cung đình	1	7	03 Nguyễn Sinh Cung, Vỹ Dạ, Thành phố Huế, Thừa Thiên Huế	\N	16.4592000	107.5984000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.4	2025-06-04 22:07:19.274+07	2025-06-04 22:07:19.274+07
173	Tham quan Lăng Tự Đức	4	7	Xã Thủy Xuân, Thành phố Huế, Thừa Thiên Huế	\N	16.4311000	107.5528000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.5	2025-06-04 22:07:19.279+07	2025-06-04 22:07:19.279+07
174	Uống cafe	2	7	1 Nguyễn Thái Học, Phú Hội, Thành phố Huế, Thừa Thiên Huế	\N	16.4678000	107.5879000	/images/cafe-default.jpg	7:00 - 22:00	\N	\N	60	\N	4.0	2025-06-04 22:07:19.284+07	2025-06-04 22:07:19.284+07
175	Ăn tối Bánh Khoái	1	7	06 Đinh Tiên Hoàng, Phú Hòa, Thành phố Huế, Thừa Thiên Huế	\N	16.4714000	107.5889000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	75	\N	4.3	2025-06-04 22:07:19.289+07	2025-06-04 22:07:19.289+07
176	Đi thuyền nghe ca Huế trên sông Hương	4	7	Lê Lợi, Vĩnh Ninh, Thành phố Huế, Thừa Thiên Huế	\N	16.4667000	107.5883000	/images/place-default.jpg	8:00 - 17:00	\N	\N	90	\N	4.4	2025-06-04 22:07:19.293+07	2025-06-04 22:07:19.293+07
177	Ăn sáng Cơm Hến	1	7	64 Kiệt 7 Ưng Bình, Vỹ Dạ, Thành phố Huế, Thừa Thiên Huế	\N	16.4618000	107.5949000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.1	2025-06-04 22:07:19.3+07	2025-06-04 22:07:19.3+07
178	Tham quan Chùa Thiên Mụ	4	7	Kim Long, Thành phố Huế, Thừa Thiên Huế	\N	16.4889000	107.5606000	/images/place-default.jpg	8:00 - 17:00	\N	\N	90	\N	4.7	2025-06-04 22:07:19.304+07	2025-06-04 22:07:19.304+07
179	Tham quan Làng Hương Thủy Xuân	4	7	Thôn Thượng 3, Phường Thủy Xuân, Thành phố Huế, Thừa Thiên Huế	\N	16.4358000	107.5573000	/images/place-default.jpg	8:00 - 17:00	\N	\N	90	\N	4.5	2025-06-04 22:07:19.308+07	2025-06-04 22:07:19.308+07
180	Ăn trưa Bún thịt nướng	1	7	52 Kim Long, Thành phố Huế, Thừa Thiên Huế	\N	16.4871000	107.5633000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.2	2025-06-04 22:07:19.313+07	2025-06-04 22:07:19.313+07
219	Ăn trưa tại nhà hàng gần Bãi Đá Móng Rồng	1	52	Cô Tô, Quảng Ninh	\N	20.7885000	107.6568000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.0	2025-06-05 21:00:51.326+07	2025-06-05 21:00:51.326+07
181	Mua sắm tại Chợ Đông Ba	5	7	Trần Hưng Đạo, Phú Hòa, Thành phố Huế, Thừa Thiên Huế	\N	16.4744000	107.5894000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	120	\N	4.0	2025-06-04 22:07:19.318+07	2025-06-04 22:07:19.318+07
182	Uống Chè Huế	2	7	1 Kiệt 29 Hùng Vương, Phú Hội, Thành phố Huế, Thừa Thiên Huế	\N	16.4686000	107.5856000	/images/cafe-default.jpg	7:00 - 22:00	\N	\N	60	\N	4.5	2025-06-04 22:07:19.323+07	2025-06-04 22:07:19.323+07
183	Ăn tối tại Nhà hàng chay	1	7	03 Lê Quý Đôn, Phú Hội, Thành phố Huế, Thừa Thiên Huế	\N	16.4661000	107.5898000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	75	\N	4.6	2025-06-04 22:07:19.326+07	2025-06-04 22:07:19.326+07
184	Bữa sáng phở cuốn	1	8	Số 25 Ngõ 29 Nguyễn Khả Trạc, Mai Dịch, Cầu Giấy, Hà Nội	\N	21.0379000	105.7813000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	75	\N	4.6	2025-06-04 22:16:41.184+07	2025-06-04 22:16:41.184+07
185	Tham quan Bảo tàng Hà Nội	4	8	Đường Phạm Hùng, Mễ Trì, Nam Từ Liêm, Hà Nội	\N	21.0063000	105.7866000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.4	2025-06-04 22:16:41.217+07	2025-06-04 22:16:41.217+07
186	Ăn trưa bún đậu mắm tôm	1	8	Ngõ 31 Hàng Khay, Tràng Tiền, Hoàn Kiếm, Hà Nội	\N	21.0269000	105.8538000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	75	\N	4.3	2025-06-04 22:16:41.222+07	2025-06-04 22:16:41.222+07
187	Khám phá Royal City	5	8	72A Nguyễn Trãi, Thượng Đình, Thanh Xuân, Hà Nội	\N	20.9969000	105.8144000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	150	\N	4.5	2025-06-04 22:16:41.227+07	2025-06-04 22:16:41.227+07
188	Uống cà phê trứng	2	8	39 Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội	\N	21.0326000	105.8538000	/images/cafe-default.jpg	7:00 - 22:00	\N	\N	60	\N	4.7	2025-06-04 22:16:41.231+07	2025-06-04 22:16:41.231+07
189	Ăn tối tại nhà hàng lẩu nấm Ashima	1	8	24 Nguyễn Chánh, Trung Hòa, Cầu Giấy, Hà Nội	\N	21.0136000	105.7994000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.6	2025-06-04 22:16:41.237+07	2025-06-04 22:16:41.237+07
190	Ăn sáng bánh cuốn nóng	1	8	16 Ngõ Gốc Đề, Minh Khai, Hai Bà Trưng, Hà Nội	\N	20.9886000	105.8583000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.5	2025-06-04 22:16:41.242+07	2025-06-04 22:16:41.242+07
191	Tham quan Chợ Ngã Tư Sở	5	8	Ngã Tư Sở, Đống Đa, Hà Nội	\N	21.0033000	105.8227000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	120	\N	4.2	2025-06-04 22:16:41.246+07	2025-06-04 22:16:41.246+07
192	Ăn trưa bún chả	1	8	24 Lê Văn Hưu, Phan Chu Trinh, Hoàn Kiếm, Hà Nội	\N	21.0258000	105.8563000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	75	\N	4.7	2025-06-04 22:16:41.25+07	2025-06-04 22:16:41.25+07
193	Massage thư giãn	5	8	Số 5 Ngõ Tràng Tiền, Hoàn Kiếm, Hà Nội	\N	21.0268000	105.8548000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	90	\N	4.6	2025-06-04 22:16:41.254+07	2025-06-04 22:16:41.254+07
194	Uống trà chanh	2	8	Nhà thờ Lớn Hà Nội	\N	21.0303000	105.8524000	/images/cafe-default.jpg	7:00 - 22:00	\N	\N	60	\N	4.3	2025-06-04 22:16:41.259+07	2025-06-04 22:16:41.259+07
195	Ăn tối nem nướng	1	8	105 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội	\N	21.0348000	105.7849000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.4	2025-06-04 22:16:41.264+07	2025-06-04 22:16:41.264+07
196	Đến Sa Pa bằng xe khách	4	42	Đường Trần Phú, Phường Phố Mới, Lào Cai	\N	22.4885000	103.9714000	/images/place-default.jpg	8:00 - 17:00	\N	\N	360	\N	4.0	2025-06-05 20:55:25.712+07	2025-06-05 20:55:25.712+07
197	Nhận phòng khách sạn ở Sa Pa	3	42	Số 3 Cầu Mây, Sa Pa, Lào Cai	\N	22.3374000	103.8399000	/images/hotel-default.jpg	24/7	\N	\N	60	\N	4.2	2025-06-05 20:55:25.833+07	2025-06-05 20:55:25.833+07
198	Ăn trưa tại nhà hàng địa phương	1	42	15 Thạch Sơn, Sa Pa, Lào Cai	\N	22.3379000	103.8418000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.3	2025-06-05 20:55:25.838+07	2025-06-05 20:55:25.838+07
199	Tham quan Nhà thờ đá Sa Pa	4	42	Đường Thạch Sơn, Sa Pa, Lào Cai	\N	22.3376000	103.8424000	/images/place-default.jpg	8:00 - 17:00	\N	\N	90	\N	4.5	2025-06-05 20:55:25.843+07	2025-06-05 20:55:25.843+07
200	Đi dạo quanh Hồ Sa Pa	4	42	Trung tâm thị trấn Sa Pa, Lào Cai	\N	22.3366000	103.8417000	/images/place-default.jpg	8:00 - 17:00	\N	\N	60	\N	4.4	2025-06-05 20:55:25.847+07	2025-06-05 20:55:25.847+07
201	Ăn tối tại chợ đêm Sa Pa	1	42	Trung tâm thị trấn Sa Pa, Lào Cai	\N	22.3371000	103.8405000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.2	2025-06-05 20:55:25.852+07	2025-06-05 20:55:25.852+07
202	Tham quan núi Hàm Rồng	4	42	Sa Pa, Lào Cai	\N	22.3396000	103.8451000	/images/place-default.jpg	8:00 - 17:00	\N	\N	180	\N	4.6	2025-06-05 20:55:25.857+07	2025-06-05 20:55:25.857+07
203	Ăn trưa tại nhà hàng gần bản Cát Cát	1	42	Gần bản Cát Cát, Sa Pa, Lào Cai	\N	22.3297000	103.8333000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.1	2025-06-05 20:55:25.861+07	2025-06-05 20:55:25.861+07
204	Tham quan bản Cát Cát	4	42	Xã San Sả Hồ, Sa Pa, Lào Cai	\N	22.3267000	103.8325000	/images/place-default.jpg	8:00 - 17:00	\N	\N	180	\N	4.7	2025-06-05 20:55:25.865+07	2025-06-05 20:55:25.865+07
205	Cafe tại quán cafe view đẹp	2	42	Km3, Đường Cát Cát, Sa Pa, Lào Cai	\N	22.3226000	103.8229000	/images/cafe-default.jpg	7:00 - 22:00	\N	\N	90	\N	4.5	2025-06-05 20:55:25.869+07	2025-06-05 20:55:25.869+07
206	Ăn tối tại nhà hàng lẩu cá tầm	1	42	Số 8, đường Xuân Viên, Sa Pa, Lào Cai	\N	22.3373000	103.8410000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.4	2025-06-05 20:55:25.875+07	2025-06-05 20:55:25.875+07
207	Mua sắm quà lưu niệm	5	42	Trung tâm thị trấn Sa Pa, Lào Cai	\N	22.3371000	103.8405000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	90	\N	4.3	2025-06-05 20:55:25.88+07	2025-06-05 20:55:25.88+07
208	Ăn trưa trước khi về	1	42	Gần bến xe Sa Pa, Lào Cai	\N	22.3355000	103.8390000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.0	2025-06-05 20:55:25.885+07	2025-06-05 20:55:25.885+07
209	Di chuyển về Lào Cai và kết thúc chuyến đi	4	42	Sa Pa, Lào Cai	\N	22.3355000	103.8390000	/images/place-default.jpg	8:00 - 17:00	\N	\N	60	\N	4.0	2025-06-05 20:55:25.889+07	2025-06-05 20:55:25.889+07
210	Di chuyển từ Hà Nội đến Hạ Long	4	52	Hà Nội	\N	21.0278000	105.8342000	/images/place-default.jpg	8:00 - 17:00	\N	\N	240	\N	4.0	2025-06-05 21:00:51.22+07	2025-06-05 21:00:51.22+07
211	Ăn trưa tại Hạ Long	1	52	Số 32 Phan Chu Trinh, Bãi Cháy, Hạ Long, Quảng Ninh	\N	20.9543000	107.0624000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.5	2025-06-05 21:00:51.278+07	2025-06-05 21:00:51.278+07
212	Di chuyển đến Cảng Cái Rồng	4	52	Vân Đồn, Quảng Ninh	\N	20.7867000	107.4189000	/images/place-default.jpg	8:00 - 17:00	\N	\N	60	\N	4.0	2025-06-05 21:00:51.286+07	2025-06-05 21:00:51.286+07
213	Đi tàu cao tốc ra đảo Cô Tô	4	52	Vân Đồn, Quảng Ninh	\N	20.7867000	107.4189000	/images/place-default.jpg	8:00 - 17:00	\N	\N	90	\N	4.5	2025-06-05 21:00:51.292+07	2025-06-05 21:00:51.292+07
214	Nhận phòng khách sạn tại Cô Tô	3	52	Khu 4, Cô Tô, Quảng Ninh	\N	20.7912000	107.6415000	/images/hotel-default.jpg	24/7	\N	\N	60	\N	4.0	2025-06-05 21:00:51.297+07	2025-06-05 21:00:51.297+07
215	Tắm biển tại bãi Vàn Chảy	4	52	Cô Tô, Quảng Ninh	\N	20.7985000	107.6354000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.7	2025-06-05 21:00:51.304+07	2025-06-05 21:00:51.304+07
216	Ăn tối tại nhà hàng trên đảo Cô Tô	1	52	Khu 4, Cô Tô, Quảng Ninh	\N	20.7901000	107.6428000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.3	2025-06-05 21:00:51.309+07	2025-06-05 21:00:51.309+07
217	Tham quan ngọn hải đăng Cô Tô	4	52	Cô Tô, Quảng Ninh	\N	20.7856000	107.6532000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.6	2025-06-05 21:00:51.315+07	2025-06-05 21:00:51.315+07
218	Tham quan Bãi Đá Móng Rồng	4	52	Cô Tô, Quảng Ninh	\N	20.7885000	107.6568000	/images/place-default.jpg	8:00 - 17:00	\N	\N	90	\N	4.5	2025-06-05 21:00:51.321+07	2025-06-05 21:00:51.321+07
220	Tham quan nhà thờ Cô Tô	4	52	Cô Tô, Quảng Ninh	\N	20.7909000	107.6433000	/images/place-default.jpg	8:00 - 17:00	\N	\N	60	\N	4.2	2025-06-05 21:00:51.332+07	2025-06-05 21:00:51.332+07
221	Tắm biển tại bãi Tình Yêu	4	52	Cô Tô, Quảng Ninh	\N	20.7915000	107.6456000	/images/place-default.jpg	8:00 - 17:00	\N	\N	120	\N	4.4	2025-06-05 21:00:51.341+07	2025-06-05 21:00:51.341+07
222	Ăn tối và thưởng thức hải sản nướng BBQ	1	52	Cô Tô, Quảng Ninh	\N	20.7912000	107.6415000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	120	\N	4.6	2025-06-05 21:00:51.347+07	2025-06-05 21:00:51.347+07
223	Ăn sáng tại Cô Tô	1	52	Cô Tô, Quảng Ninh	\N	20.7912000	107.6415000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	60	\N	4.0	2025-06-05 21:00:51.355+07	2025-06-05 21:00:51.355+07
224	Mua sắm quà lưu niệm	5	52	Cô Tô, Quảng Ninh	\N	20.7921000	107.6439000	/images/shopping-default.jpg	9:00 - 21:00	\N	\N	90	\N	4.1	2025-06-05 21:00:51.362+07	2025-06-05 21:00:51.362+07
225	Trả phòng khách sạn	3	52	Khu 4, Cô Tô, Quảng Ninh	\N	20.7912000	107.6415000	/images/hotel-default.jpg	24/7	\N	\N	30	\N	4.0	2025-06-05 21:00:51.369+07	2025-06-05 21:00:51.369+07
226	Di chuyển từ Cô Tô về Cảng Cái Rồng	4	52	Cô Tô, Quảng Ninh	\N	20.7924000	107.6442000	/images/place-default.jpg	8:00 - 17:00	\N	\N	90	\N	4.5	2025-06-05 21:00:51.375+07	2025-06-05 21:00:51.375+07
227	Di chuyển từ Cảng Cái Rồng về Hạ Long	4	52	Vân Đồn, Quảng Ninh	\N	20.7867000	107.4189000	/images/place-default.jpg	8:00 - 17:00	\N	\N	60	\N	4.0	2025-06-05 21:00:51.382+07	2025-06-05 21:00:51.382+07
228	Ăn trưa tại Hạ Long	1	52	Số 50, Đường Halong, Bãi Cháy, Hạ Long, Quảng Ninh	\N	20.9536000	107.0612000	/images/restaurant-default.jpg	11:00 - 22:00	\N	\N	90	\N	4.3	2025-06-05 21:00:51.388+07	2025-06-05 21:00:51.388+07
229	Di chuyển từ Hạ Long về Hà Nội	4	52	Hạ Long, Quảng Ninh	\N	20.9500000	107.0700000	/images/place-default.jpg	8:00 - 17:00	\N	\N	240	\N	4.0	2025-06-05 21:00:51.394+07	2025-06-05 21:00:51.394+07
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, user_id, place_id, rating, comment, visit_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: saved_places; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.saved_places (id, user_id, place_id, notes, created_at) FROM stdin;
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tags (id, name, description) FROM stdin;
\.


--
-- Data for Name: transportation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transportation (id, from_place_id, to_place_id, mode, duration_minutes, distance_km, estimated_cost) FROM stdin;
\.


--
-- Data for Name: trip_collaborators; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trip_collaborators (trip_id, user_id, permission_level, created_at) FROM stdin;
\.


--
-- Data for Name: trip_days; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trip_days (id, trip_id, day_number, date, notes, created_at, updated_at) FROM stdin;
11	14	1	2025-05-26	\N	2025-05-26 16:34:25.136+07	2025-05-26 16:34:25.136+07
12	14	2	2025-05-27	\N	2025-05-26 16:34:25.16+07	2025-05-26 16:34:25.16+07
13	14	3	2025-05-28	\N	2025-05-26 16:34:25.164+07	2025-05-26 16:34:25.164+07
14	14	4	2025-05-29	\N	2025-05-26 16:34:25.167+07	2025-05-26 16:34:25.167+07
15	14	5	2025-05-30	\N	2025-05-26 16:34:25.172+07	2025-05-26 16:34:25.172+07
16	15	1	2025-05-29	\N	2025-05-27 16:15:30.805+07	2025-05-27 16:15:30.805+07
17	15	2	2025-05-30	\N	2025-05-27 16:15:30.903+07	2025-05-27 16:15:30.903+07
18	15	3	2025-05-31	\N	2025-05-27 16:15:30.906+07	2025-05-27 16:15:30.906+07
22	16	1	2025-05-30	\N	2025-05-27 16:27:42.193+07	2025-05-27 16:27:42.193+07
23	16	2	2025-05-31	\N	2025-05-27 16:27:42.227+07	2025-05-27 16:27:42.227+07
24	16	3	2025-06-01	\N	2025-05-27 16:27:42.232+07	2025-05-27 16:27:42.232+07
25	16	4	2025-06-02	\N	2025-05-27 16:27:42.238+07	2025-05-27 16:27:42.238+07
26	17	1	2025-05-29	\N	2025-05-27 16:56:59.249+07	2025-05-27 16:56:59.249+07
27	17	2	2025-05-30	\N	2025-05-27 16:56:59.278+07	2025-05-27 16:56:59.278+07
28	17	3	2025-05-31	\N	2025-05-27 16:56:59.282+07	2025-05-27 16:56:59.282+07
29	18	1	2025-05-29	\N	2025-05-27 17:21:52.246+07	2025-05-27 17:21:52.246+07
30	18	2	2025-05-30	\N	2025-05-27 17:21:52.286+07	2025-05-27 17:21:52.286+07
31	18	3	2025-05-31	\N	2025-05-27 17:21:52.308+07	2025-05-27 17:21:52.308+07
32	19	1	2025-05-29	\N	2025-05-28 09:28:37.464+07	2025-05-28 09:28:37.464+07
33	19	2	2025-05-30	\N	2025-05-28 09:28:37.607+07	2025-05-28 09:28:37.607+07
34	19	3	2025-05-31	\N	2025-05-28 09:28:37.648+07	2025-05-28 09:28:37.648+07
37	21	1	2025-07-10	\N	2025-05-29 18:50:44.078+07	2025-05-29 18:50:44.078+07
38	21	2	2025-07-11	\N	2025-05-29 18:50:44.109+07	2025-05-29 18:50:44.109+07
39	22	1	2025-05-29	\N	2025-05-29 18:55:39.8+07	2025-05-29 18:55:39.8+07
40	22	2	2025-05-30	\N	2025-05-29 18:55:39.836+07	2025-05-29 18:55:39.836+07
41	22	3	2025-05-31	\N	2025-05-29 18:55:39.856+07	2025-05-29 18:55:39.856+07
42	23	1	2025-05-30	\N	2025-05-30 23:19:00.818+07	2025-05-30 23:19:00.818+07
43	23	2	2025-05-31	\N	2025-05-30 23:19:00.97+07	2025-05-30 23:19:00.97+07
44	23	3	2025-06-01	\N	2025-05-30 23:19:01.002+07	2025-05-30 23:19:01.002+07
46	24	1	2025-06-02	\N	2025-05-31 23:28:31.978+07	2025-05-31 23:28:31.978+07
47	24	2	2025-06-03	\N	2025-05-31 23:28:32.215+07	2025-05-31 23:28:32.215+07
48	24	3	2025-06-04	\N	2025-05-31 23:28:32.342+07	2025-05-31 23:28:32.342+07
49	25	1	2025-06-01	\N	2025-06-01 09:34:43.943+07	2025-06-01 09:34:43.943+07
50	25	2	2025-06-02	\N	2025-06-01 09:34:44.092+07	2025-06-01 09:34:44.092+07
51	25	3	2025-06-03	\N	2025-06-01 09:34:44.126+07	2025-06-01 09:34:44.126+07
77	26	1	2025-06-01	\N	2025-06-01 12:58:08.788+07	2025-06-01 12:58:08.788+07
78	26	2	2025-06-02	\N	2025-06-01 12:58:08.82+07	2025-06-01 12:58:08.82+07
79	26	3	2025-06-03	\N	2025-06-01 12:58:08.837+07	2025-06-01 12:58:08.837+07
80	27	1	2025-07-05	\N	2025-06-04 22:02:38.973+07	2025-06-04 22:02:38.973+07
81	27	2	2025-07-06	\N	2025-06-04 22:02:39.213+07	2025-06-04 22:02:39.213+07
82	28	1	2025-06-05	\N	2025-06-04 22:07:19.223+07	2025-06-04 22:07:19.223+07
83	28	2	2025-06-06	\N	2025-06-04 22:07:19.296+07	2025-06-04 22:07:19.296+07
84	29	1	2025-06-08	\N	2025-06-04 22:16:41.177+07	2025-06-04 22:16:41.177+07
85	29	2	2025-06-09	\N	2025-06-04 22:16:41.24+07	2025-06-04 22:16:41.24+07
86	31	1	2025-07-08	\N	2025-06-05 20:55:25.706+07	2025-06-05 20:55:25.706+07
87	31	2	2025-07-09	\N	2025-06-05 20:55:25.854+07	2025-06-05 20:55:25.854+07
88	31	3	2025-07-10	\N	2025-06-05 20:55:25.878+07	2025-06-05 20:55:25.878+07
95	32	1	2025-06-05	\N	2025-06-05 23:27:21.494+07	2025-06-05 23:27:21.494+07
96	32	2	2025-06-06	\N	2025-06-05 23:27:21.513+07	2025-06-05 23:27:21.513+07
97	32	3	2025-06-07	\N	2025-06-05 23:27:21.528+07	2025-06-05 23:27:21.528+07
100	34	1	2025-06-05	\N	2025-06-05 23:38:17.013+07	2025-06-05 23:38:17.013+07
101	34	2	2025-06-06	\N	2025-06-05 23:38:17.028+07	2025-06-05 23:38:17.028+07
\.


--
-- Data for Name: trip_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trip_expenses (id, trip_id, category, amount, currency, description, date, created_at) FROM stdin;
\.


--
-- Data for Name: trip_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trip_tags (trip_id, tag_id) FROM stdin;
\.


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trips (id, user_id, name, destination, city_id, start_date, end_date, description, cover_image_url, status, is_public, created_at, updated_at) FROM stdin;
14	1	Khám phá Phú Quốc	Phú Quốc	\N	2025-05-26	2025-05-30	Lịch trình 5 ngày khám phá Phú Quốc được tạo bởi AI	/images/default-trip.jpg	draft	f	2025-05-26 16:34:25.13+07	2025-05-26 16:34:25.13+07
34	6	Hà Nội 1	Hà Nội	1	2025-06-05	2025-06-06		/images/default-trip.jpg	draft	f	2025-06-05 23:37:57.361+07	2025-06-05 23:38:17.001+07
16	1	Khám phá Sa Pa	Sa Pa	\N	2025-05-30	2025-06-02	Lịch trình 4 ngày khám phá Sa Pa được tạo bởi AI	/images/default-trip.jpg	draft	f	2025-05-27 16:27:42.188+07	2025-05-27 16:27:42.188+07
17	1	Đà Nẵng	Đà Nẵng	\N	2025-05-29	2025-05-31	Lịch trình 3 ngày khám phá Đà Nẵng được tạo bởi AI	/images/default-trip.jpg	draft	f	2025-05-27 16:56:59.245+07	2025-05-27 16:56:59.245+07
19	1	Khám phá Văn hóa và Lịch sử Bình Phước	Bình Phước	\N	2025-05-29	2025-05-31	Lịch trình 3 ngày khám phá Bình Phước được tạo bởi AI	/images/default-trip.jpg	draft	f	2025-05-28 09:28:37.452+07	2025-05-28 09:28:37.452+07
20	1	Sa Pa custome	Sa Pa	\N	2025-05-31	2025-06-06		/images/default-trip.jpg	draft	f	2025-05-28 09:30:50.337+07	2025-05-28 09:30:50.337+07
21	1	Khám phá Thái Nguyên 2 ngày	Thái Nguyên	\N	2025-07-10	2025-07-11	Lịch trình 2 ngày khám phá Thái Nguyên được tạo bởi AI	/images/default-trip.jpg	draft	f	2025-05-29 18:50:44.07+07	2025-05-29 18:50:44.07+07
22	1	Bắc Ninh	Bắc Ninh	\N	2025-05-29	2025-05-31	Lịch trình 3 ngày khám phá Bắc Ninh được tạo bởi AI	/images/default-trip.jpg	draft	f	2025-05-29 18:55:39.796+07	2025-05-29 18:55:39.796+07
15	1	Khám phá Hà Nội	Hà Nội	1	2025-05-29	2025-05-31	Lịch trình 3 ngày khám phá Hà Nội được tạo bởi AI	/images/default-trip.jpg	draft	f	2025-05-27 16:15:30.796+07	2025-05-27 16:15:30.796+07
18	1	Khám phá Sài Gòn 3 ngày	Sài Gòn	2	2025-05-29	2025-05-31	Lịch trình 3 ngày khám phá Sài Gòn được tạo bởi AI	/images/default-trip.jpg	draft	f	2025-05-27 17:21:52.243+07	2025-05-27 17:21:52.243+07
23	6	Khám Phá Hà Nội Cổ Kính & Ẩm Thực	Hà Nội	1	2025-05-30	2025-06-01	Lịch trình 3 ngày khám phá Hà Nội được tạo bởi AI	/images/default-trip.jpg	draft	f	2025-05-30 23:19:00.814+07	2025-05-30 23:19:00.814+07
24	6	Hà Nội 	Hà Nội	1	2025-06-02	2025-06-04	Lịch trình 3 ngày khám phá Hà Nội được tạo bởi AI	/images/default-trip.jpg	draft	f	2025-05-31 23:28:31.96+07	2025-05-31 23:28:31.96+07
25	6	Bắc Ninh	Đà Nẵng	5	2025-06-01	2025-06-03	Lịch trình 3 ngày khám phá Đà Nẵng được tạo bởi AI	/images/default-trip.jpg	draft	f	2025-06-01 09:34:43.929+07	2025-06-01 09:34:43.929+07
26	6	Khám phá Đà Nẵng 3 ngày	Đà Nẵng	5	2025-06-01	2025-06-03	Lịch trình 3 ngày khám phá Đà Nẵng được tạo bởi AI	/images/default-trip.jpg	completed	f	2025-06-01 10:05:51.47+07	2025-06-01 12:50:33.973+07
27	6	Khám phá Ninh Bình 2 ngày	Ninh Bình	6	2025-07-05	2025-07-06	Lịch trình 2 ngày khám phá Ninh Bình được tạo bởi AI	/images/default-trip.jpg	draft	f	2025-06-04 22:02:38.957+07	2025-06-04 22:02:38.957+07
28	6	Huế	Huế	7	2025-06-05	2025-06-06	Lịch trình 2 ngày khám phá Huế được tạo bởi AI	/images/default-trip.jpg	draft	f	2025-06-04 22:07:19.219+07	2025-06-04 22:07:19.219+07
29	6	Khám phá ẩm thực Thanh Xuân	Thanh Xuân, Hà Nội	8	2025-06-08	2025-06-09	Lịch trình 2 ngày khám phá Thanh Xuân, Hà Nội được tạo bởi AI	/images/default-trip.jpg	draft	f	2025-06-04 22:16:41.173+07	2025-06-04 22:16:41.173+07
30	6	Vi vu Hà Nội	Hà Nội	1	2025-06-05	2025-06-05		/images/default-trip.jpg	draft	f	2025-06-05 08:34:39.896+07	2025-06-05 08:34:39.896+07
31	6	Khám phá Sa Pa 3 ngày 2 đêm	Lào Cai	42	2025-07-08	2025-07-10	Lịch trình 3 ngày khám phá Lào Cai được tạo bởi AI	/images/default-trip.jpg	draft	f	2025-06-05 20:55:25.694+07	2025-06-05 20:55:25.694+07
32	6	Khám phá Cô Tô và Quảng Ninh	Quảng Ninh	52	2025-06-05	2025-06-07	Lịch trình 3 ngày khám phá Quảng Ninh được tạo bởi AI	/images/default-trip.jpg	planned	f	2025-06-05 21:00:51.212+07	2025-06-05 23:27:21.49+07
33	6	Hà Nội	Hà Nội	1	2025-06-05	2025-06-06		/images/default-trip.jpg	draft	f	2025-06-05 22:43:50.409+07	2025-06-05 23:27:29.587+07
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, full_name, avatar_url, created_at, updated_at) FROM stdin;
2	demouser	demo@example.com	ZGVtbzEyMw==	Demo User	\N	2025-05-26 14:48:47.205+07	2025-05-26 14:48:47.205+07
6	nhdandz	nhdandz@gmail.com	$2b$10$CDZk5vqBwof0BFEaMfXgjutQOLOR3lHdCktDEDhVV3Zl42urnENbu	Nguyễn Hải Đăng	\N	2025-05-28 15:46:01.215+07	2025-05-28 15:46:01.215+07
3	admin	admin@example.com	$2b$10$CDZk5vqBwof0BFEaMfXgjutQOLOR3lHdCktDEDhVV3Zl42urnENbu	Admin User	\N	2025-05-26 14:48:47.206+07	2025-05-26 14:48:47.206+07
1	testuser	test@example.com	$2b$10$CDZk5vqBwof0BFEaMfXgjutQOLOR3lHdCktDEDhVV3Zl42urnENbu	Test User	\N	2025-05-26 14:48:47.201+07	2025-05-31 16:38:42.49+07
\.


--
-- Data for Name: weather_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.weather_data (id, city_id, date, temperature_high, temperature_low, condition, precipitation_chance, created_at) FROM stdin;
1	1	2025-05-30	35.00	25.00	sunny	50.00	2025-05-30 09:35:39.951+07
3	1	2025-05-29	25.00	25.00	cloudy	37.00	2025-05-30 09:55:39.699+07
4	2	2025-05-29	30.00	30.00	sunny	0.00	2025-05-30 09:55:40.028+07
6	3	2025-05-29	27.00	27.00	rain	40.00	2025-05-30 23:13:22.241+07
7	2	2025-05-30	27.00	27.00	rain	87.00	2025-05-31 16:35:02.154+07
8	3	2025-05-30	28.00	28.00	rain	56.00	2025-05-31 16:35:02.399+07
9	4	2025-05-30	34.00	34.00	cloudy	48.00	2025-05-31 16:35:02.632+07
10	1	2025-05-31	34.00	34.00	cloudy	47.00	2025-06-01 10:08:26.876+07
11	2	2025-05-31	32.00	31.00	cloudy	0.00	2025-06-01 10:08:27.04+07
12	3	2025-05-31	29.00	29.00	cloudy	40.00	2025-06-01 10:08:27.199+07
13	4	2025-05-31	34.00	34.00	cloudy	46.00	2025-06-01 10:08:27.401+07
14	5	2025-05-31	34.00	34.00	cloudy	0.00	2025-06-01 10:08:27.561+07
15	5	2025-06-01	36.00	27.00	cloudy	0.00	2025-06-01 12:07:01.505+07
16	5	2025-06-02	37.00	28.00	cloudy	0.00	2025-06-01 12:07:01.67+07
19	1	2025-06-03	32.00	26.00	cloudy	50.00	2025-06-01 22:17:49.568+07
18	1	2025-06-01	33.00	31.00	cloudy	0.00	2025-06-01 22:17:49.616+07
17	1	2025-06-02	38.00	27.00	cloudy	0.00	2025-06-01 22:17:49.62+07
20	2	2025-06-03	27.00	27.00	cloudy	0.00	2025-06-04 22:10:37.724+07
21	3	2025-06-03	25.00	25.00	cloudy	0.00	2025-06-04 22:10:38.109+07
22	4	2025-06-03	29.00	29.00	rain	12.00	2025-06-04 22:10:38.367+07
23	5	2025-06-03	29.00	29.00	cloudy	0.00	2025-06-04 22:10:38.723+07
24	13	2025-06-04	30.00	30.00	cloudy	0.00	2025-06-05 09:52:52.19+07
25	1	2025-06-04	30.00	30.00	rain	24.00	2025-06-05 09:52:52.478+07
26	2	2025-06-04	32.00	31.00	cloudy	0.00	2025-06-05 09:52:52.684+07
27	17	2025-06-04	31.00	31.00	cloudy	50.00	2025-06-05 09:52:52.877+07
28	3	2025-06-04	30.00	30.00	cloudy	0.00	2025-06-05 09:52:53.083+07
29	4	2025-06-04	30.00	30.00	rain	46.00	2025-06-05 09:52:53.285+07
30	31	2025-06-04	31.00	31.00	cloudy	0.00	2025-06-05 09:52:53.478+07
31	9	2025-06-04	31.00	31.00	cloudy	0.00	2025-06-05 09:52:53.714+07
32	10	2025-06-04	31.00	31.00	cloudy	38.00	2025-06-05 09:52:53.927+07
33	11	2025-06-04	32.00	32.00	rain	46.00	2025-06-05 09:52:54.128+07
34	12	2025-06-04	32.00	32.00	cloudy	50.00	2025-06-05 09:52:54.324+07
35	14	2025-06-04	30.00	30.00	rain	45.00	2025-06-05 09:52:54.521+07
36	15	2025-06-04	28.00	28.00	cloudy	50.00	2025-06-05 09:52:54.734+07
37	16	2025-06-04	32.00	32.00	cloudy	50.00	2025-06-05 09:52:54.941+07
38	18	2025-06-04	33.00	33.00	cloudy	47.00	2025-06-05 09:52:55.147+07
39	19	2025-06-04	31.00	31.00	cloudy	0.00	2025-06-05 09:52:55.341+07
40	20	2025-06-04	32.00	32.00	cloudy	0.00	2025-06-05 09:52:55.533+07
41	21	2025-06-04	33.00	33.00	cloudy	50.00	2025-06-05 09:52:55.734+07
42	22	2025-06-04	29.00	29.00	cloudy	50.00	2025-06-05 09:52:55.925+07
43	23	2025-06-04	29.00	29.00	cloudy	38.00	2025-06-05 09:52:56.127+07
44	24	2025-06-04	26.00	26.00	cloudy	0.00	2025-06-05 09:52:56.318+07
45	25	2025-06-04	24.00	24.00	rain	24.00	2025-06-05 09:52:56.508+07
46	26	2025-06-04	30.00	30.00	cloudy	0.00	2025-06-05 09:52:56.712+07
47	27	2025-06-04	32.00	32.00	cloudy	45.00	2025-06-05 09:52:56.91+07
48	28	2025-06-04	28.00	28.00	cloudy	40.00	2025-06-05 09:52:57.118+07
49	29	2025-06-04	25.00	25.00	rain	60.00	2025-06-05 09:52:57.321+07
50	30	2025-06-04	31.00	31.00	rain	41.00	2025-06-05 09:52:57.533+07
51	33	2025-06-04	32.00	32.00	cloudy	50.00	2025-06-05 09:52:57.724+07
52	34	2025-06-04	29.00	29.00	cloudy	50.00	2025-06-05 09:52:57.936+07
53	35	2025-06-04	32.00	32.00	rain	31.00	2025-06-05 09:52:58.135+07
54	36	2025-06-04	33.00	33.00	cloudy	47.00	2025-06-05 09:52:58.335+07
55	37	2025-06-04	30.00	30.00	cloudy	50.00	2025-06-05 09:52:58.538+07
56	38	2025-06-04	29.00	29.00	cloudy	46.00	2025-06-05 09:52:58.852+07
57	39	2025-06-04	24.00	24.00	rain	32.00	2025-06-05 09:52:59.133+07
58	40	2025-06-04	28.00	28.00	cloudy	0.00	2025-06-05 09:52:59.436+07
59	41	2025-06-04	29.00	29.00	rain	65.00	2025-06-05 09:52:59.703+07
60	42	2025-06-04	25.00	25.00	cloudy	50.00	2025-06-05 09:52:59.928+07
61	43	2025-06-04	31.00	31.00	cloudy	0.00	2025-06-05 09:53:00.118+07
62	44	2025-06-04	32.00	32.00	cloudy	0.00	2025-06-05 09:53:00.308+07
63	45	2025-06-04	29.00	29.00	cloudy	0.00	2025-06-05 09:53:00.499+07
64	46	2025-06-04	33.00	33.00	cloudy	0.00	2025-06-05 09:53:00.685+07
65	47	2025-06-04	28.00	28.00	rain	100.00	2025-06-05 09:53:00.894+07
66	48	2025-06-04	33.00	33.00	cloudy	49.00	2025-06-05 09:53:01.107+07
67	49	2025-06-04	34.00	34.00	cloudy	44.00	2025-06-05 09:53:01.329+07
68	50	2025-06-04	32.00	32.00	cloudy	50.00	2025-06-05 09:53:01.518+07
69	51	2025-06-04	35.00	35.00	cloudy	50.00	2025-06-05 09:53:01.727+07
70	52	2025-06-04	32.00	32.00	cloudy	0.00	2025-06-05 09:53:01.935+07
71	53	2025-06-04	34.00	34.00	cloudy	47.00	2025-06-05 09:53:02.156+07
72	54	2025-06-04	32.00	32.00	cloudy	50.00	2025-06-05 09:53:02.356+07
73	55	2025-06-04	23.00	23.00	cloudy	50.00	2025-06-05 09:53:02.569+07
74	56	2025-06-04	32.00	32.00	cloudy	0.00	2025-06-05 09:53:02.749+07
75	57	2025-06-04	32.00	32.00	cloudy	0.00	2025-06-05 09:53:02.933+07
76	58	2025-06-04	30.00	30.00	rain	82.00	2025-06-05 09:53:03.121+07
77	59	2025-06-04	32.00	32.00	cloudy	0.00	2025-06-05 09:53:03.316+07
78	60	2025-06-04	31.00	31.00	cloudy	0.00	2025-06-05 09:53:03.528+07
79	61	2025-06-04	31.00	31.00	cloudy	50.00	2025-06-05 09:53:03.712+07
80	62	2025-06-04	31.00	31.00	cloudy	49.00	2025-06-05 09:53:03.899+07
81	63	2025-06-04	28.00	28.00	rain	100.00	2025-06-05 09:53:04.095+07
82	64	2025-06-04	31.00	31.00	cloudy	50.00	2025-06-05 09:53:04.292+07
83	5	2025-06-04	31.00	31.00	cloudy	0.00	2025-06-05 09:53:04.533+07
84	6	2025-06-04	32.00	32.00	cloudy	0.00	2025-06-05 09:53:04.742+07
85	7	2025-06-04	31.00	31.00	cloudy	0.00	2025-06-05 09:53:04.937+07
86	8	2025-06-04	30.00	30.00	rain	37.00	2025-06-05 09:53:05.132+07
87	65	2025-06-04	30.00	30.00	cloudy	50.00	2025-06-05 09:53:05.353+07
88	66	2025-06-04	26.00	26.00	cloudy	50.00	2025-06-05 09:53:05.67+07
89	8	2025-06-08	38.00	26.00	cloudy	50.00	2025-06-05 09:54:34.361+07
90	8	2025-06-07	37.00	28.00	cloudy	31.00	2025-06-05 09:54:34.364+07
91	7	2025-06-05	33.00	25.00	cloudy	0.00	2025-06-05 09:54:40.632+07
92	6	2025-07-04	27.00	19.00	sunny	24.00	2025-06-05 10:01:02.942+07
93	6	2025-07-05	31.00	23.00	sunny	6.00	2025-06-05 10:01:02.991+07
94	13	2025-06-05	29.00	29.00	rain	100.00	2025-06-05 16:01:55.193+07
95	1	2025-06-05	32.00	32.00	cloudy	50.00	2025-06-05 16:01:55.496+07
96	2	2025-06-05	32.00	32.00	cloudy	0.00	2025-06-05 16:01:55.691+07
97	17	2025-06-05	30.00	30.00	cloudy	39.00	2025-06-05 16:01:55.882+07
98	3	2025-06-05	30.00	30.00	cloudy	49.00	2025-06-05 16:01:56.084+07
99	4	2025-06-05	32.00	32.00	cloudy	49.00	2025-06-05 16:01:56.291+07
100	31	2025-06-05	31.00	31.00	cloudy	0.00	2025-06-05 16:01:56.473+07
101	9	2025-06-05	32.00	32.00	sunny	0.00	2025-06-05 16:01:56.659+07
102	10	2025-06-05	31.00	31.00	rain	18.00	2025-06-05 16:01:56.909+07
103	11	2025-06-05	32.00	32.00	cloudy	50.00	2025-06-05 16:01:57.114+07
104	12	2025-06-05	31.00	31.00	cloudy	0.00	2025-06-05 16:01:57.312+07
105	14	2025-06-05	32.00	32.00	cloudy	50.00	2025-06-05 16:01:57.488+07
106	15	2025-06-05	30.00	30.00	cloudy	48.00	2025-06-05 16:01:57.666+07
107	16	2025-06-05	33.00	33.00	cloudy	42.00	2025-06-05 16:01:57.838+07
108	18	2025-06-05	30.00	30.00	cloudy	50.00	2025-06-05 16:01:58.032+07
109	19	2025-06-05	30.00	30.00	cloudy	49.00	2025-06-05 16:01:58.214+07
110	20	2025-06-05	32.00	32.00	cloudy	0.00	2025-06-05 16:01:58.383+07
111	21	2025-06-05	32.00	32.00	cloudy	0.00	2025-06-05 16:01:58.556+07
112	22	2025-06-05	32.00	32.00	cloudy	0.00	2025-06-05 16:01:58.746+07
113	23	2025-06-05	28.00	28.00	cloudy	48.00	2025-06-05 16:01:58.922+07
114	24	2025-06-05	25.00	25.00	rain	21.00	2025-06-05 16:01:59.112+07
115	25	2025-06-05	29.00	29.00	cloudy	50.00	2025-06-05 16:01:59.31+07
116	26	2025-06-05	28.00	28.00	cloudy	50.00	2025-06-05 16:01:59.487+07
117	27	2025-06-05	31.00	31.00	cloudy	0.00	2025-06-05 16:01:59.672+07
118	28	2025-06-05	27.00	27.00	cloudy	39.00	2025-06-05 16:01:59.841+07
119	29	2025-06-05	32.00	32.00	cloudy	50.00	2025-06-05 16:02:00.027+07
120	30	2025-06-05	31.00	31.00	rain	100.00	2025-06-05 16:02:00.232+07
121	33	2025-06-05	33.00	33.00	rain	65.00	2025-06-05 16:02:00.436+07
122	34	2025-06-05	30.00	30.00	cloudy	0.00	2025-06-05 16:02:00.615+07
123	35	2025-06-05	32.00	32.00	rain	100.00	2025-06-05 16:02:00.799+07
124	36	2025-06-05	33.00	33.00	cloudy	50.00	2025-06-05 16:02:00.98+07
125	37	2025-06-05	30.00	30.00	cloudy	0.00	2025-06-05 16:02:01.177+07
126	38	2025-06-05	28.00	28.00	rain	32.00	2025-06-05 16:02:01.609+07
127	39	2025-06-05	24.00	24.00	cloudy	48.00	2025-06-05 16:02:01.902+07
128	40	2025-06-05	25.00	25.00	cloudy	0.00	2025-06-05 16:02:02.098+07
129	41	2025-06-05	30.00	30.00	cloudy	40.00	2025-06-05 16:02:02.325+07
130	42	2025-06-05	30.00	30.00	cloudy	50.00	2025-06-05 16:02:02.53+07
131	43	2025-06-05	29.00	29.00	cloudy	50.00	2025-06-05 16:02:02.715+07
132	44	2025-06-05	32.00	32.00	cloudy	45.00	2025-06-05 16:02:02.882+07
133	45	2025-06-05	28.00	28.00	cloudy	0.00	2025-06-05 16:02:03.08+07
134	46	2025-06-05	33.00	33.00	cloudy	0.00	2025-06-05 16:02:03.256+07
135	47	2025-06-05	32.00	32.00	cloudy	47.00	2025-06-05 16:02:03.449+07
136	48	2025-06-05	34.00	34.00	cloudy	50.00	2025-06-05 16:02:03.646+07
137	49	2025-06-05	31.00	31.00	rain	28.00	2025-06-05 16:02:03.816+07
138	50	2025-06-05	32.00	32.00	rain	100.00	2025-06-05 16:02:03.99+07
139	51	2025-06-05	34.00	34.00	cloudy	49.00	2025-06-05 16:02:04.179+07
140	52	2025-06-05	31.00	31.00	cloudy	49.00	2025-06-05 16:02:04.381+07
141	53	2025-06-05	32.00	32.00	rain	87.00	2025-06-05 16:02:04.588+07
142	54	2025-06-05	32.00	32.00	cloudy	48.00	2025-06-05 16:02:04.757+07
143	55	2025-06-05	28.00	28.00	cloudy	50.00	2025-06-05 16:02:04.94+07
144	56	2025-06-05	33.00	33.00	cloudy	41.00	2025-06-05 16:02:05.119+07
145	57	2025-06-05	32.00	32.00	cloudy	36.00	2025-06-05 16:02:05.304+07
146	58	2025-06-05	32.00	32.00	cloudy	44.00	2025-06-05 16:02:05.477+07
147	59	2025-06-05	31.00	31.00	cloudy	0.00	2025-06-05 16:02:05.665+07
148	60	2025-06-05	33.00	33.00	cloudy	0.00	2025-06-05 16:02:05.856+07
149	61	2025-06-05	29.00	29.00	rain	13.00	2025-06-05 16:02:06.031+07
150	62	2025-06-05	31.00	31.00	rain	13.00	2025-06-05 16:02:06.224+07
151	63	2025-06-05	32.00	32.00	cloudy	50.00	2025-06-05 16:02:06.396+07
152	64	2025-06-05	31.00	31.00	rain	37.00	2025-06-05 16:02:06.571+07
153	5	2025-06-05	33.00	33.00	cloudy	0.00	2025-06-05 16:02:06.756+07
154	6	2025-06-05	32.00	32.00	cloudy	47.00	2025-06-05 16:02:06.938+07
155	8	2025-06-05	32.00	32.00	cloudy	50.00	2025-06-05 16:02:07.137+07
156	65	2025-06-05	32.00	32.00	cloudy	49.00	2025-06-05 16:02:07.318+07
157	66	2025-06-05	29.00	29.00	cloudy	50.00	2025-06-05 16:02:07.523+07
158	42	2025-07-09	31.00	23.00	rain	56.00	2025-06-05 20:55:28.185+07
159	42	2025-07-08	32.00	24.00	sunny	21.00	2025-06-05 20:55:28.186+07
160	42	2025-07-07	33.00	25.00	cloudy	8.00	2025-06-05 20:55:28.186+07
161	52	2025-06-06	32.00	26.00	cloudy	0.00	2025-06-05 21:00:52.031+07
162	1	2025-05-28	29.00	29.00	cloudy	0.00	2025-06-05 22:42:49.907+07
163	13	2025-06-06	31.00	31.00	cloudy	42.00	2025-06-06 10:04:36.412+07
164	1	2025-06-06	30.00	30.00	cloudy	0.00	2025-06-06 10:04:36.611+07
165	2	2025-06-06	32.00	31.00	cloudy	38.00	2025-06-06 10:04:36.808+07
166	17	2025-06-06	31.00	31.00	cloudy	47.00	2025-06-06 10:04:36.99+07
167	3	2025-06-06	30.00	30.00	cloudy	48.00	2025-06-06 10:04:37.18+07
168	4	2025-06-06	30.00	30.00	rain	100.00	2025-06-06 10:04:37.376+07
169	31	2025-06-06	32.00	32.00	cloudy	0.00	2025-06-06 10:04:37.555+07
170	9	2025-06-06	32.00	32.00	cloudy	0.00	2025-06-06 10:04:37.745+07
171	10	2025-06-06	28.00	28.00	cloudy	38.00	2025-06-06 10:04:37.934+07
172	11	2025-06-06	31.00	31.00	cloudy	0.00	2025-06-06 10:04:38.122+07
173	12	2025-06-06	31.00	31.00	cloudy	41.00	2025-06-06 10:04:38.305+07
174	14	2025-06-06	31.00	31.00	rain	100.00	2025-06-06 10:04:38.489+07
175	15	2025-06-06	27.00	27.00	cloudy	48.00	2025-06-06 10:04:38.674+07
176	16	2025-06-06	32.00	32.00	cloudy	46.00	2025-06-06 10:04:38.866+07
177	18	2025-06-06	33.00	33.00	cloudy	0.00	2025-06-06 10:04:39.057+07
178	19	2025-06-06	32.00	32.00	cloudy	0.00	2025-06-06 10:04:39.232+07
179	20	2025-06-06	33.00	33.00	cloudy	0.00	2025-06-06 10:04:39.43+07
180	21	2025-06-06	32.00	32.00	cloudy	0.00	2025-06-06 10:04:39.636+07
181	22	2025-06-06	27.00	27.00	cloudy	50.00	2025-06-06 10:04:39.822+07
182	23	2025-06-06	30.00	30.00	cloudy	0.00	2025-06-06 10:04:40.004+07
183	24	2025-06-06	27.00	27.00	cloudy	0.00	2025-06-06 10:04:40.189+07
184	25	2025-06-06	28.00	28.00	cloudy	38.00	2025-06-06 10:04:40.369+07
185	26	2025-06-06	31.00	31.00	cloudy	0.00	2025-06-06 10:04:40.57+07
186	27	2025-06-06	31.00	31.00	cloudy	48.00	2025-06-06 10:04:40.758+07
187	28	2025-06-06	28.00	28.00	cloudy	43.00	2025-06-06 10:04:40.945+07
188	29	2025-06-06	27.00	27.00	rain	12.00	2025-06-06 10:04:41.128+07
189	30	2025-06-06	32.00	32.00	cloudy	0.00	2025-06-06 10:04:41.381+07
190	33	2025-06-06	32.00	32.00	cloudy	50.00	2025-06-06 10:04:41.617+07
191	34	2025-06-06	31.00	31.00	cloudy	0.00	2025-06-06 10:04:41.867+07
192	35	2025-06-06	32.00	32.00	cloudy	0.00	2025-06-06 10:04:42.075+07
193	36	2025-06-06	32.00	32.00	cloudy	44.00	2025-06-06 10:04:42.28+07
194	37	2025-06-06	30.00	30.00	cloudy	42.00	2025-06-06 10:04:42.483+07
195	38	2025-06-06	29.00	29.00	cloudy	0.00	2025-06-06 10:04:42.7+07
196	39	2025-06-06	25.00	25.00	cloudy	45.00	2025-06-06 10:04:42.892+07
197	40	2025-06-06	26.00	26.00	cloudy	0.00	2025-06-06 10:04:43.098+07
198	41	2025-06-06	29.00	29.00	cloudy	0.00	2025-06-06 10:04:43.323+07
199	42	2025-06-06	31.00	31.00	cloudy	0.00	2025-06-06 10:04:43.516+07
200	43	2025-06-06	32.00	32.00	cloudy	0.00	2025-06-06 10:04:43.711+07
201	44	2025-06-06	32.00	32.00	cloudy	0.00	2025-06-06 10:04:43.915+07
202	45	2025-06-06	30.00	30.00	cloudy	43.00	2025-06-06 10:04:44.121+07
203	46	2025-06-06	33.00	33.00	cloudy	0.00	2025-06-06 10:04:44.325+07
204	47	2025-06-06	31.00	31.00	cloudy	44.00	2025-06-06 10:04:44.542+07
205	48	2025-06-06	33.00	33.00	cloudy	0.00	2025-06-06 10:04:44.734+07
206	49	2025-06-06	35.00	35.00	cloudy	39.00	2025-06-06 10:04:44.939+07
207	50	2025-06-06	33.00	33.00	sunny	0.00	2025-06-06 10:04:45.158+07
208	51	2025-06-06	36.00	36.00	cloudy	0.00	2025-06-06 10:04:45.333+07
209	53	2025-06-06	35.00	35.00	cloudy	0.00	2025-06-06 10:04:45.534+07
210	54	2025-06-06	32.00	32.00	cloudy	50.00	2025-06-06 10:04:45.717+07
211	55	2025-06-06	29.00	29.00	cloudy	0.00	2025-06-06 10:04:45.908+07
212	56	2025-06-06	33.00	33.00	cloudy	42.00	2025-06-06 10:04:46.085+07
213	57	2025-06-06	31.00	31.00	cloudy	0.00	2025-06-06 10:04:46.274+07
214	58	2025-06-06	31.00	31.00	cloudy	46.00	2025-06-06 10:04:46.459+07
215	59	2025-06-06	32.00	32.00	cloudy	38.00	2025-06-06 10:04:46.659+07
216	60	2025-06-06	37.00	37.00	cloudy	0.00	2025-06-06 10:04:46.83+07
217	61	2025-06-06	31.00	31.00	cloudy	44.00	2025-06-06 10:04:47.013+07
218	62	2025-06-06	32.00	32.00	cloudy	48.00	2025-06-06 10:04:47.206+07
219	63	2025-06-06	29.00	29.00	cloudy	42.00	2025-06-06 10:04:47.399+07
220	64	2025-06-06	31.00	31.00	cloudy	50.00	2025-06-06 10:04:47.58+07
221	5	2025-06-06	33.00	33.00	cloudy	0.00	2025-06-06 10:04:47.761+07
222	6	2025-06-06	33.00	33.00	cloudy	0.00	2025-06-06 10:04:47.946+07
223	7	2025-06-06	37.00	37.00	cloudy	0.00	2025-06-06 10:04:48.126+07
224	8	2025-06-06	30.00	30.00	cloudy	0.00	2025-06-06 10:04:48.31+07
225	65	2025-06-06	30.00	30.00	cloudy	41.00	2025-06-06 10:04:48.623+07
226	66	2025-06-06	29.00	29.00	cloudy	49.00	2025-06-06 10:04:48.854+07
\.


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 9, true);


--
-- Name: cities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cities_id_seq', 8, true);


--
-- Name: itinerary_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.itinerary_items_id_seq', 410, true);


--
-- Name: place_photos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.place_photos_id_seq', 1, false);


--
-- Name: places_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.places_id_seq', 229, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- Name: saved_places_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.saved_places_id_seq', 1, false);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tags_id_seq', 1, false);


--
-- Name: transportation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transportation_id_seq', 1, false);


--
-- Name: trip_days_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trip_days_id_seq', 101, true);


--
-- Name: trip_expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trip_expenses_id_seq', 1, false);


--
-- Name: trips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trips_id_seq', 34, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: weather_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.weather_data_id_seq', 226, true);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: itinerary_items itinerary_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_items
    ADD CONSTRAINT itinerary_items_pkey PRIMARY KEY (id);


--
-- Name: itinerary_items itinerary_items_trip_day_id_order_index_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_items
    ADD CONSTRAINT itinerary_items_trip_day_id_order_index_key UNIQUE (trip_day_id, order_index);


--
-- Name: nearby_places nearby_places_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nearby_places
    ADD CONSTRAINT nearby_places_pkey PRIMARY KEY (place_id, nearby_place_id);


--
-- Name: place_photos place_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_photos
    ADD CONSTRAINT place_photos_pkey PRIMARY KEY (id);


--
-- Name: places places_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: saved_places saved_places_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_places
    ADD CONSTRAINT saved_places_pkey PRIMARY KEY (id);


--
-- Name: saved_places saved_places_user_id_place_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_places
    ADD CONSTRAINT saved_places_user_id_place_id_key UNIQUE (user_id, place_id);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: transportation transportation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transportation
    ADD CONSTRAINT transportation_pkey PRIMARY KEY (id);


--
-- Name: trip_collaborators trip_collaborators_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_collaborators
    ADD CONSTRAINT trip_collaborators_pkey PRIMARY KEY (trip_id, user_id);


--
-- Name: trip_days trip_days_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_days
    ADD CONSTRAINT trip_days_pkey PRIMARY KEY (id);


--
-- Name: trip_days trip_days_trip_id_day_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_days
    ADD CONSTRAINT trip_days_trip_id_day_number_key UNIQUE (trip_id, day_number);


--
-- Name: trip_expenses trip_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_expenses
    ADD CONSTRAINT trip_expenses_pkey PRIMARY KEY (id);


--
-- Name: trip_tags trip_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_tags
    ADD CONSTRAINT trip_tags_pkey PRIMARY KEY (trip_id, tag_id);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: weather_data weather_data_city_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weather_data
    ADD CONSTRAINT weather_data_city_id_date_key UNIQUE (city_id, date);


--
-- Name: weather_data weather_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weather_data
    ADD CONSTRAINT weather_data_pkey PRIMARY KEY (id);


--
-- Name: idx_itinerary_items_place; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_items_place ON public.itinerary_items USING btree (place_id);


--
-- Name: idx_itinerary_items_trip_day; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_itinerary_items_trip_day ON public.itinerary_items USING btree (trip_day_id);


--
-- Name: idx_places_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_places_category ON public.places USING btree (category_id);


--
-- Name: idx_places_city; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_places_city ON public.places USING btree (city_id);


--
-- Name: idx_reviews_place; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_place ON public.reviews USING btree (place_id);


--
-- Name: idx_reviews_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_user ON public.reviews USING btree (user_id);


--
-- Name: idx_saved_places_place; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_saved_places_place ON public.saved_places USING btree (place_id);


--
-- Name: idx_saved_places_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_saved_places_user ON public.saved_places USING btree (user_id);


--
-- Name: idx_trip_days_trip; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trip_days_trip ON public.trip_days USING btree (trip_id);


--
-- Name: idx_trips_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trips_user ON public.trips USING btree (user_id);


--
-- Name: places trigger_update_nearby_places; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_nearby_places AFTER INSERT OR UPDATE ON public.places FOR EACH ROW EXECUTE FUNCTION public.update_nearby_places();


--
-- Name: reviews trigger_update_place_rating; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_place_rating AFTER INSERT OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_place_rating();


--
-- Name: itinerary_items itinerary_items_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_items
    ADD CONSTRAINT itinerary_items_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE;


--
-- Name: itinerary_items itinerary_items_trip_day_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_items
    ADD CONSTRAINT itinerary_items_trip_day_id_fkey FOREIGN KEY (trip_day_id) REFERENCES public.trip_days(id) ON DELETE CASCADE;


--
-- Name: nearby_places nearby_places_nearby_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nearby_places
    ADD CONSTRAINT nearby_places_nearby_place_id_fkey FOREIGN KEY (nearby_place_id) REFERENCES public.places(id) ON DELETE CASCADE;


--
-- Name: nearby_places nearby_places_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nearby_places
    ADD CONSTRAINT nearby_places_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE;


--
-- Name: place_photos place_photos_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_photos
    ADD CONSTRAINT place_photos_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE;


--
-- Name: place_photos place_photos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place_photos
    ADD CONSTRAINT place_photos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: places places_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: places places_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.places
    ADD CONSTRAINT places_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: reviews reviews_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: saved_places saved_places_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_places
    ADD CONSTRAINT saved_places_place_id_fkey FOREIGN KEY (place_id) REFERENCES public.places(id) ON DELETE CASCADE;


--
-- Name: saved_places saved_places_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_places
    ADD CONSTRAINT saved_places_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: transportation transportation_from_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transportation
    ADD CONSTRAINT transportation_from_place_id_fkey FOREIGN KEY (from_place_id) REFERENCES public.places(id) ON DELETE SET NULL;


--
-- Name: transportation transportation_to_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transportation
    ADD CONSTRAINT transportation_to_place_id_fkey FOREIGN KEY (to_place_id) REFERENCES public.places(id) ON DELETE SET NULL;


--
-- Name: trip_collaborators trip_collaborators_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_collaborators
    ADD CONSTRAINT trip_collaborators_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: trip_collaborators trip_collaborators_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_collaborators
    ADD CONSTRAINT trip_collaborators_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: trip_days trip_days_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_days
    ADD CONSTRAINT trip_days_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: trip_expenses trip_expenses_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_expenses
    ADD CONSTRAINT trip_expenses_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: trip_tags trip_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_tags
    ADD CONSTRAINT trip_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: trip_tags trip_tags_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trip_tags
    ADD CONSTRAINT trip_tags_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: trips trips_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: trips trips_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: weather_data weather_data_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weather_data
    ADD CONSTRAINT weather_data_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

