import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './superbase.ts';
import { useAuth } from './authcontext.jsx';
import './shoppage2.css';

// Univer Delivery Tarification (55 Wilayas in DZD)[cite: 4, 5]
const UNIVER_TARIFS = [
    { code: '16', name: 'Alger', domicile: 350, stopDesk: 150 },
    { code: '09', name: 'Blida', domicile: 550, stopDesk: 350 },
    { code: '35', name: 'Boumerdes', domicile: 550, stopDesk: 400 },
    { code: '42', name: 'Tipaza', domicile: 550, stopDesk: 400 },
    { code: '02', name: 'Chlef', domicile: 700, stopDesk: 450 },
    { code: '10', name: 'Bouira', domicile: 700, stopDesk: 450 },
    { code: '15', name: 'Tizi Ouzou', domicile: 700, stopDesk: 450 },
    { code: '26', name: 'Médéa', domicile: 700, stopDesk: 450 },
    { code: '04', name: 'Oum El Bouaghi', domicile: 750, stopDesk: 500 },
    { code: '05', name: 'Batna', domicile: 750, stopDesk: 450 },
    { code: '06', name: 'Bejaia', domicile: 750, stopDesk: 450 },
    { code: '13', name: 'Tlemcen', domicile: 750, stopDesk: 450 },
    { code: '18', name: 'Jijel', domicile: 750, stopDesk: 450 },
    { code: '19', name: 'Setif', domicile: 750, stopDesk: 450 },
    { code: '22', name: 'Sidi Bel Abbes', domicile: 750, stopDesk: 450 },
    { code: '23', name: 'Annaba', domicile: 750, stopDesk: 450 },
    { code: '25', name: 'Constantine', domicile: 750, stopDesk: 450 },
    { code: '27', name: 'Mostaganem', domicile: 750, stopDesk: 450 },
    { code: '28', name: "M'Sila", domicile: 750, stopDesk: 450 },
    { code: '29', name: 'Mascara', domicile: 750, stopDesk: 450 },
    { code: '31', name: 'Oran', domicile: 750, stopDesk: 450 },
    { code: '34', name: 'Bordj Bou Arreridj', domicile: 750, stopDesk: 450 },
    { code: '38', name: 'Tissemsilt', domicile: 750, stopDesk: 500 },
    { code: '43', name: 'Mila', domicile: 750, stopDesk: 450 },
    { code: '44', name: 'Ain Defla', domicile: 750, stopDesk: 450 },
    { code: '46', name: 'Ain Temouchent', domicile: 750, stopDesk: 450 },
    { code: '48', name: 'Relizane', domicile: 750, stopDesk: 450 },
    { code: '21', name: 'Skikda', domicile: 800, stopDesk: 450 },
    { code: '12', name: 'Tebessa', domicile: 850, stopDesk: 600 },
    { code: '14', name: 'Tiaret', domicile: 850, stopDesk: 550 },
    { code: '24', name: 'Guelma', domicile: 850, stopDesk: 550 },
    { code: '36', name: 'El Tarf', domicile: 850, stopDesk: 550 },
    { code: '40', name: 'Khenchela', domicile: 850, stopDesk: 550 },
    { code: '41', name: 'Souk Ahras', domicile: 850, stopDesk: 550 },
    { code: '03', name: 'Laghouat', domicile: 900, stopDesk: 650 },
    { code: '17', name: 'Djelfa', domicile: 900, stopDesk: 600 },
    { code: '20', name: 'Saida', domicile: 900, stopDesk: 550 },
    { code: '07', name: 'Biskra', domicile: 950, stopDesk: 600 },
    { code: '30', name: 'Ouargla', domicile: 1000, stopDesk: 650 },
    { code: '39', name: 'El Oued', domicile: 1000, stopDesk: 700 },
    { code: '47', name: 'Ghardaia', domicile: 1000, stopDesk: 650 },
    { code: '51', name: 'Ouled Djellal', domicile: 1000, stopDesk: 600 },
    { code: '57', name: "El M'Ghair", domicile: 1000, stopDesk: null },
    { code: '55', name: 'Touggourt', domicile: 1100, stopDesk: 700 },
    { code: '58', name: 'El Meniaa', domicile: 1100, stopDesk: 750 },
    { code: '08', name: 'Bechar', domicile: 1150, stopDesk: 750 },
    { code: '32', name: 'El Bayadh', domicile: 1200, stopDesk: 750 },
    { code: '45', name: 'Naama', domicile: 1200, stopDesk: 750 },
    { code: '52', name: 'Beni Abbes', domicile: 1200, stopDesk: 750 },
    { code: '01', name: 'Adrar', domicile: 1400, stopDesk: 850 },
    { code: '49', name: 'Timimoun', domicile: 1400, stopDesk: 900 },
    { code: '37', name: 'Tindouf', domicile: 1500, stopDesk: 990 },
    { code: '53', name: 'In Salah', domicile: 1600, stopDesk: 1100 },
    { code: '11', name: 'Tamanrasset', domicile: 1700, stopDesk: 1250 },
    { code: '33', name: 'Illizi', domicile: 1850, stopDesk: 1200 }
];

// Complete Baladiyat (Communes) for all 55 Wilayas
const COMMUNES_BY_WILAYA = {
    'Adrar': ['Adrar', 'Reggane', 'Aoulef', 'Zaouiet Kounta', 'Fenoughil', 'Tamentit', 'Tsabit', 'In Zghmir', 'Sali', 'Akabli', 'Ouled Ahmed Timmi', 'Bouda', 'Sebaa', 'Tit'],
    'Chlef': ['Chlef', 'Ténès', 'Oued Fodda', 'Boukadir', 'Echatt', 'Chettia', 'Ouled Fares', 'El Karimia', 'Taougrite', 'Beni Haoua', 'Sendjas', 'Oued Sly', 'Aïn Merane', 'Sobha', 'Zeboudja', 'Abou El Hassan', 'El Marsa', 'Harchoun', 'Sidi Akkacha'],
    'Laghouat': ['Laghouat', 'Aflou', 'Ksar El Hirane', 'Hassi R\'Mel', 'Aïn Madhi', 'Brida', 'El Ghicha', 'Gueltat Sidi Saad', 'Bennasser Benchohra', 'Sidi Makhlouf', 'Tadjemout', 'El Assafia'],
    'Oum El Bouaghi': ['Oum El Bouaghi', 'Aïn Beïda', 'Aïn M\'lila', 'Aïn Fakroun', 'Aïn Babouche', 'Aïn Kercha', 'Meskiana', 'Sigus', 'Souk Naamane', 'Ouled Hamla', 'Dhalaa', 'Fkirina', 'Ksar Sbahi'],
    'Batna': ['Batna', 'Barika', 'Aïn Touta', 'Merouana', 'Arris', 'Tazoult', 'N\'Gaous', 'El Madher', 'Timgad', 'Ras El Aioun', 'Seriana', 'Menaa', 'Chemora', 'Bitam', 'Ouled Si Slimane', 'Fesdis', 'Djerma'],
    'Bejaia': ['Béjaïa', 'Akbou', 'El Kseur', 'Amizour', 'Sidi Aïch', 'Kherrata', 'Aokas', 'Tichy', 'Seddouk', 'Tazmalt', 'Timezrit', 'Souk El Ténine', 'Chemini', 'Ouzellaguen', 'Ighil Ali', 'Barbacha', 'Adekar'],
    'Biskra': ['Biskra', 'Tolga', 'Sidi Okba', 'El Kantara', 'Ourlal', 'Zeribet El Oued', 'El Outaya', 'Foughala', 'Lichana', 'Bouchagroune', 'Djemorah', 'M\'Chouneche', 'Chetma', 'El Hadjeb'],
    'Bechar': ['Béchar', 'Kenadsa', 'Abadla', 'Taghit', 'Beni Ounif', 'Lahmar', 'Boukais', 'Mogheul', 'Erg Ferradj', 'Meridja', 'Mechraa Houari Boumediene'],
    'Blida': ['Blida', 'Boufarik', 'Ouled Yaïch', 'Beni Mered', 'Mouzaïa', 'El Affroun', 'Chiffa', 'Meftah', 'Bougara', 'Larbaa', 'Oued Alleug', 'Soumaa', 'Beni Tamou', 'Guerrouaou', 'Chebli', 'Bouinan', 'Chréa', 'Hammam Melouane', 'Oued Djer', 'Aïn Romana'],
    'Bouira': ['Bouira', 'Lakhdaria', 'Sour El Ghozlane', 'M\'Chedallah', 'Aïn Bessem', 'Bir Ghbalou', 'Haizer', 'Bechloul', 'El Hachimia', 'Kadiria', 'Aomar', 'Chorfa', 'Souk El Khemis'],
    'Tamanrasset': ['Tamanrasset', 'In Amguel', 'Idles', 'Tazrouk', 'Abalessa'],
    'Tebessa': ['Tébessa', 'Bir El Ater', 'Cheria', 'Ouenza', 'El Aouinet', 'El Kouif', 'Morsott', 'Negrine', 'El Ogla', 'Hammamet', 'Bekkaria', 'Boulhaf Dir', 'El Ma Labiodh'],
    'Tlemcen': ['Tlemcen', 'Maghnia', 'Mansourah', 'Chetouane', 'Remchi', 'Nedroma', 'Ghazaouet', 'Sebdou', 'Hennaya', 'Sabra', 'Ouled Mimoun', 'Bensekrane', 'Bab El Assa', 'Marsa Ben M\'Hidi', 'Beni Snous', 'Hammam Boughrara'],
    'Tiaret': ['Tiaret', 'Sougueur', 'Frenda', 'Ksar Chellala', 'Mahdia', 'Rahouia', 'Aïn Deheb', 'Aïn Kermes', 'Dahmouni', 'Medroussa', 'Meghila', 'Mellakou', 'Oued Lili', 'Takhemaret'],
    'Tizi Ouzou': ['Tizi Ouzou', 'Draa Ben Khedda', 'Azazga', 'Tigzirt', 'Boghni', 'Larbaa Nath Irathen', 'Aïn El Hammam', 'Draa El Mizan', 'Ouadhia', 'Azeffoun', 'Mekla', 'Tizi Gheniff', 'Beni Douala', 'Ouaguenoun', 'Maatkas', 'Freha', 'Makouda'],
    'Alger': [
        'Alger Centre', 'Sidi M\'Hamed', 'El Madania', 'Belouizdad', 'Bab El Oued',
        'Bologhine', 'Casbah', 'Oued Koriche', 'Bir Mourad Raïs', 'El Biar',
        'Bouzaréah', 'Ben Aknoun', 'Dely Ibrahim', 'Hydra', 'El Achour',
        'Draria', 'Baba Hassen', 'Khraicia', 'Saoula', 'Chéraga (شراقة)',
        'Ouled Fayet (أولاد فايت)', 'Aïn Benian', 'Staoueli', 'Zéralda', 'Souidania',
        'Douera', 'Rahmania', 'Mahelma', 'Hussein Dey', 'Kouba (القبة)',
        'Bachdjerrah', 'El Magharia', 'Bourouba', 'El Harrach (الحراش)', 'Oued Smar',
        'Mohammadia', 'Bab Ezzouar (باب الزوار)', 'Baraki (براقي)', 'Les Eucalyptus (الكاليتوس)',
        'Sidi Moussa', 'Birtouta', 'Ouled Chebel', 'Tessala El Merdja',
        'Dar El Beïda (الدار البيضاء)', 'Bordj El Kiffan (برج الكيفان)', 'Bordj El Bahri',
        'El Marsa', 'Aïn Taya', 'Heuraoua', 'Reghaïa', 'Rouïba (الرويبة)',
        'Beni Messous', 'Hammamet', 'Rais Hamidou', 'Gué de Constantine (جسر قسنطينة)',
        'Birkhadem (بئر خادم)', 'El Mouradia'
    ],
    'Djelfa': ['Djelfa', 'Aïn Oussera', 'Messaad', 'Hassi Bahbah', 'Charef', 'Birine', 'Dar Chioukh', 'El Idrissia', 'Faidh El Botma', 'Had Sahary', 'Sidi Ladjel'],
    'Jijel': ['Jijel', 'Taher', 'El Milia', 'El Aouana', 'Ziama Mansouriah', 'Chekfa', 'Kaous', 'Texenna', 'Emir Abdelkader', 'Sidi Maarouf', 'Settara'],
    'Setif': ['Sétif', 'El Eulma', 'Aïn Oulmene', 'Aïn Arnat', 'Bougaa', 'Aïn Azel', 'Beni Aziz', 'Salah Bey', 'Aïn El Kebira', 'Amoucha', 'Bouandas', 'Guenzet', 'Hammam Guergour', 'Hammam Sokhna', 'Babor', 'Guidjel'],
    'Saida': ['Saïda', 'Aïn El Hadjar', 'Youb', 'Ouled Brahim', 'Sidi Boubekeur', 'El Hassasna', 'Maamora', 'Ouled Khaled', 'Hounet'],
    'Skikda': ['Skikda', 'Azzaba', 'Collo', 'El Harrouch', 'Tamalous', 'Ben Azzouz', 'Ramdane Djamel', 'Beni Bechir', 'Sidi Mezghiche', 'Zitouna', 'Ouled Attia', 'Hamadi Krouma', 'Filfila'],
    'Sidi Bel Abbes': ['Sidi Bel Abbès', 'Telagh', 'Sfisef', 'Ben Badis', 'Aïn El Berd', 'Mostefa Ben Brahim', 'Sidi Ali Boussidi', 'Tabia', 'Ras El Ma', 'Tenira', 'Sidi Lahcene', 'Sidi Brahim'],
    'Annaba': ['Annaba', 'El Bouni', 'Sidi Amar', 'El Hadjar', 'Berrahal', 'Seraïdi', 'Aïn Berda', 'Chetaïbi', 'El Eulma', 'Treat', 'Oued El Aneb', 'Cheurfa'],
    'Guelma': ['Guelma', 'Oued Zenati', 'Bouchegouf', 'Héliopolis', 'Hammam Debagh', 'Hammam N\'Bail', 'Guelaat Bou Sbaa', 'Aïn Makhlouf', 'Belkheir', 'Khezaras'],
    'Constantine': ['Constantine', 'El Khroub', 'Ain Smara', 'Hamma Bouziane', 'Didouche Mourad', 'Zighoud Youcef', 'Ouled Rahmoune', 'Aïn Abid', 'Ibn Ziad', 'Messaoud Boudjeriou', 'Beni Hamiden', 'Ibn Badis'],
    'Médéa': ['Médéa', 'Berrouaghia', 'Ksar El Boukhari', 'Tablat', 'Beni Slimane', 'Chahbounia', 'Ouamri', 'Ouzera', 'El Omaria', 'Seghouane', 'Zoubirea', 'Aziz', 'Aïn Boucif'],
    'Mostaganem': ['Mostaganem', 'Aïn Tédelès', 'Sidi Ali', 'Mazagran', 'Hassi Mameche', 'Achaacha', 'Bouguirat', 'Mesra', 'Kheir Eddine', 'Sidi Lakhdar', 'Stidia'],
    "M'Sila": ['M\'Sila', 'Bou Saâda', 'Sidi Aïssa', 'Aïn El Melh', 'Magra', 'Berhoum', 'Hammam Dalaa', 'Ouled Derradj', 'Belaiba', 'Chellal', 'Khoubana', 'Maadid'],
    'Mascara': ['Mascara', 'Sig', 'Mohammadia', 'Tighennif', 'Bou Hanifia', 'Ghriss', 'Oued El Abtal', 'Aïn Fares', 'Zahana', 'El Bordj', 'Hachem', 'Oggaz'],
    'Ouargla': ['Ouargla', 'Hassi Messaoud', 'Rouissat', 'Aïn Beida', 'N\'Goussa', 'Sidi Khouiled', 'Hassi Ben Abdellah', 'El Borma'],
    'Oran': ['Oran', 'Bir El Djir', 'Es Senia', 'Arzew', 'Aïn El Turk', 'Gdyel', 'Bethioua', 'Hassi Bounif', 'Hassi Ben Okba', 'Sidi Chami', 'Mers El Kébir', 'Bousfer', 'El Ançor', 'Oued Tlelat', 'Tafraoui', 'Boutlelis', 'Misserghin', 'El Kerma', 'Ben Freha'],
    'El Bayadh': ['El Bayadh', 'Bougtob', 'Brezina', 'Labiodh Sidi Cheikh', 'Rogassa', 'Boualem', 'El Kheiter', 'Chellala', 'Boussemghoun'],
    'Illizi': ['Illizi', 'In Amenas', 'Debdeb', 'Bordj Omar Driss'],
    'Bordj Bou Arreridj': ['Bordj Bou Arreridj', 'Ras El Oued', 'Medjana', 'Mansoura', 'El Achir', 'Bir Kasdali', 'Bordj Zemoura', 'Bordj Ghedir', 'Djaafra', 'El Hamadia', 'Sidi Embarek'],
    'Boumerdes': ['Boumerdès', 'Boudouaou', 'Bordj Menaïel', 'Dellys', 'Khemis El Khechna', 'Thenia', 'Zemmouri', 'Naciria', 'Isser', 'Djinet', 'Hammedi', 'Ouled Moussa', 'Larbatache', 'Corso', 'Tidjelabine', 'Si Mustapha', 'Boudouaou El Bahri', 'Baghlia'],
    'El Tarf': ['El Tarf', 'El Kala', 'Ben M\'Hidi', 'Besbes', 'Drean', 'Bouhadjar', 'Bouteldja', 'Echatt', 'Lac des Oiseaux', 'Chbaita Mokhtar'],
    'Tindouf': ['Tindouf', 'Oum El Assel'],
    'Tissemsilt': ['Tissemsilt', 'Theniet El Had', 'Bordj Bou Naama', 'Lardjem', 'Khemisti', 'Ammari', 'Layoune', 'Ouled Bessem', 'Youssoufia'],
    'El Oued': ['El Oued', 'Guemar', 'Debila', 'Robbah', 'Hassi Khalifa', 'Taleb Larbi', 'Magrane', 'Mih Ouansa', 'Reguiba', 'Kouinine', 'Bayadha', 'Oued El Alenda'],
    'Khenchela': ['Khenchela', 'Kais', 'Chechar', 'Babar', 'El Hamma', 'Aïn Touila', 'Ouled Rechache', 'Bouhmama', 'M\'Toussa', 'Baghai'],
    'Souk Ahras': ['Souk Ahras', 'Sedrata', 'M\'Daourouch', 'Taoura', 'Mechroha', 'Haddada', 'Ouled Driss', 'Merahna', 'Bir Bouhouche', 'Khemisssa'],
    'Tipaza': ['Tipaza', 'Koléa', 'Bou Ismaïl', 'Cherchell', 'Hadjout', 'Fouka', 'Douaouda', 'Gouraya', 'Ahmar El Aïn', 'Sidi Amar', 'Damous', 'Bouraoui Belhadef', 'Khemisti', 'Aïn Tagourait', 'Attatba', 'Chaiba', 'Sidi Rached', 'Sidi Ghiles', 'Nador', 'Menaceur'],
    'Mila': ['Mila', 'Chelghoum Laïd', 'Ferdjioua', 'Grarem Gouga', 'Oued Athmania', 'Tadjenanet', 'Teleghma', 'Rouached', 'Sidi Merouane', 'Terrai Bainen', 'Zeraia'],
    'Ain Defla': ['Aïn Defla', 'Khemis Miliana', 'Miliana', 'El Attaf', 'El Abadia', 'Djendel', 'Hammam Righa', 'Aïn Lechiakh', 'Rouina', 'Boumedfaa', 'El Amra', 'Arib'],
    'Naama': ['Naâma', 'Mécheria', 'Aïn Sefra', 'Moghrar', 'Asla', 'Tiout', 'Sfissifa', 'Makman Ben Amer'],
    'Ain Temouchent': ['Aïn Témouchent', 'Beni Saf', 'Hammam Bou Hadjar', 'El Malah', 'El Amria', 'Hassi El Ghella', 'Oulhaça El Gheraba', 'Aïn El Arbaa', 'Aïn Kihal', 'Chaabat El Leham'],
    'Ghardaia': ['Ghardaïa', 'Metlili', 'Berriane', 'Guerrara', 'El Atteuf', 'Bounoura', 'Zelfana', 'Dhayet Bendhahoua', 'Sebseb'],
    'Relizane': ['Relizane', 'Oued Rhiou', 'Mazouna', 'Mendes', 'Ammi Moussa', 'Zemmora', 'Djidiouia', 'El Matmar', 'Yellel', 'Sidi M\'Hamed Ben Ali', 'Hamri'],
    'Timimoun': ['Timimoun', 'Aougrout', 'Charouine', 'Tinerkouk', 'Ouled Said', 'Deldoul', 'Metarfa', 'Ksar Kaddour', 'Talmine', 'Ouled Aïssa'],
    'Ouled Djellal': ['Ouled Djellal', 'Sidi Khaled', 'Doucen', 'Chaiba', 'Besbes', 'Ras El Miaad'],
    'Beni Abbes': ['Beni Abbes', 'Igli', 'El Ouata', 'Tamtert', 'Kerzaz', 'Timoudi', 'Beni Ikhlef', 'Ksabi', 'Ouled Khoudir', 'Tabelbala'],
    'In Salah': ['In Salah', 'In Ghar', 'Foggaret Ezzaouia'],
    'Touggourt': ['Touggourt', 'Tebesbest', 'Nezla', 'Zaouia El Abidia', 'Temacine', 'Blidet Amor', 'Meggarine', 'Sidi Slimane', 'Taibet', 'M\'Naguer', 'El Hadjira', 'El Allia'],
    "El M'Ghair": ['El M\'Ghair', 'Djamaa', 'Oum Touyour', 'Still', 'Sidi Amrane', 'Sidi Khelil', 'Tenedla', 'M\'Rara'],
    'El Meniaa': ['El Meniaa', 'Hassi Gara', 'Hassi Fehal']
};

const EMPTY_ORDER = {
    fullname: '',
    phone: '',
    address: '',
    commune: '',
    wilaya: '',
    deliveryType: 'domicile',
    honeypot: ''
};

function ShopPage2({ productId, onBack }) {
    const { isAdmin } = useAuth();

    const [product, setProduct] = useState(null);
    const [images, setImages] = useState([]);
    const [currentImg, setCurrentImg] = useState(0);
    const [sizes, setSizes] = useState([]);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    const [descEdit, setDescEdit] = useState({ show: false, draft: '' });
    const [newSize, setNewSize] = useState('');

    const [orderState, setOrderState] = useState({
        form: EMPTY_ORDER,
        sending: false,
        sent: false,
        error: ''
    });

    const [missingFields, setMissingFields] = useState({});

    const galleryRef = useRef(null);
    const hasFetched = useRef(false);
    const formOpenTimestamp = useRef(Date.now());

    const getProduct = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();
        if (error) {
            console.error(error);
            setLoading(false);
            return;
        }
        setProduct(data);
        setLoading(false);
    }, [productId]);

    const getImages = useCallback(async () => {
        const { data, error } = await supabase
            .from('product_images')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: true });
        if (error) {
            console.error(error);
            return;
        }
        setImages(data || []);
    }, [productId]);

    const getSizes = useCallback(async () => {
        const { data, error } = await supabase
            .from('product_sizes')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: true });
        if (error) {
            console.error(error);
            return;
        }
        setSizes(data || []);
    }, [productId]);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        getProduct();
        getImages();
        getSizes();
        formOpenTimestamp.current = Date.now();
    }, [getProduct, getImages, getSizes]);

    const allImages = product
        ? [{ id: 'main', image_url: product.image_url }, ...images]
        : images;

    const handleGalleryScroll = () => {
        if (!galleryRef.current) return;
        const scrollLeft = galleryRef.current.scrollLeft;
        const itemWidth = galleryRef.current.firstChild?.offsetWidth || 1;
        const index = Math.round(scrollLeft / itemWidth);
        setCurrentImg(Math.min(allImages.length - 1, Math.max(0, index)));
    };

    const addImage = async (file) => {
        if (!file) return;
        const uniquename = `${Date.now()}_${file.name}`;
        const filepath = `admin/assets/gallery/${uniquename}`;
        const { error: uploaderror } = await supabase.storage
            .from('admin-images')
            .upload(filepath, file);
        if (uploaderror) {
            console.error(uploaderror);
            return;
        }
        const { data: pub } = supabase.storage.from('admin-images').getPublicUrl(filepath);
        const { error: dberror } = await supabase
            .from('product_images')
            .insert({ product_id: productId, image_url: pub.publicUrl });
        if (dberror) {
            console.error(dberror);
            return;
        }
        await getImages();
    };

    const deleteCurrentImage = async () => {
        if (currentImg === 0) return;
        const img = images[currentImg - 1];
        if (!img) return;
        const path = img.image_url.split('/admin-images/')[1];
        if (path) await supabase.storage.from('admin-images').remove([decodeURIComponent(path)]);
        await supabase.from('product_images').delete().eq('id', img.id);
        await getImages();
        setCurrentImg(0);
    };

    const addSize = async () => {
        const trimmed = newSize.trim();
        if (!trimmed) return;
        if (sizes.find(s => s.size.toLowerCase() === trimmed.toLowerCase())) return;
        const { data, error } = await supabase
            .from('product_sizes')
            .insert({ product_id: productId, size: trimmed, available: true })
            .select()
            .single();
        if (error) {
            console.error(error);
            return;
        }
        setSizes(prev => [...prev, data]);
        setNewSize('');
    };

    const deleteSize = async (sizeRow) => {
        await supabase.from('product_sizes').delete().eq('id', sizeRow.id);
        setSizes(prev => prev.filter(s => s.id !== sizeRow.id));
        if (selectedSize === sizeRow.size) setSelectedSize(null);
    };

    const toggleSize = async (sizeRow) => {
        await supabase.from('product_sizes').update({ available: !sizeRow.available }).eq('id', sizeRow.id);
        setSizes(prev => prev.map(s => s.id === sizeRow.id ? { ...s, available: !s.available } : s));
        if (selectedSize === sizeRow.size && sizeRow.available) setSelectedSize(null);
    };

    const saveDesc = async () => {
        const { error } = await supabase
            .from('products')
            .update({ description: descEdit.draft })
            .eq('id', productId);
        if (error) {
            console.error(error);
            return;
        }
        setProduct(prev => ({ ...prev, description: descEdit.draft }));
        setDescEdit({ show: false, draft: '' });
        document.body.style.overflow = 'auto';
    };

    const checkRateLimit = () => {
        if (isAdmin) return true;
        const key = 'rikon_order_limit';
        const now = Date.now();
        const windowMs = 15 * 60 * 1000;
        const stored = JSON.parse(localStorage.getItem(key) || '[]');
        const recent = stored.filter(t => now - t < windowMs);

        if (recent.length >= 3) return false;
        recent.push(now);
        localStorage.setItem(key, JSON.stringify(recent));
        return true;
    };

    const freezeScroll = (yPos) => {
        window.scrollTo(0, yPos);
        requestAnimationFrame(() => window.scrollTo(0, yPos));
        setTimeout(() => window.scrollTo(0, yPos), 10);
    };

    const selectedWilayaObj = UNIVER_TARIFS.find(w => w.name === orderState.form.wilaya);
    const shippingCost = selectedWilayaObj
        ? (orderState.form.deliveryType === 'stopDesk' && selectedWilayaObj.stopDesk !== null
            ? selectedWilayaObj.stopDesk
            : selectedWilayaObj.domicile)
        : 0;

    const productSubtotal = product ? Number(product.price) * quantity : 0;
    const finalTotal = productSubtotal + shippingCost;

    const availableCommunes = orderState.form.wilaya
        ? (COMMUNES_BY_WILAYA[orderState.form.wilaya] || [])
        : [];

    const handleSelectSize = (sizeVal) => {
        setSelectedSize(sizeVal);
        setMissingFields(prev => ({ ...prev, size: false }));
        setOrderState(prev => ({ ...prev, error: '' }));
    };

    const updateForm = (field, value) => {
        setMissingFields(prev => ({ ...prev, [field]: false }));
        setOrderState(prev => {
            const nextForm = { ...prev.form, [field]: value };
            if (field === 'wilaya') {
                nextForm.commune = '';
                const wObj = UNIVER_TARIFS.find(w => w.name === value);
                if (wObj && wObj.stopDesk === null) {
                    nextForm.deliveryType = 'domicile';
                }
            }
            return { ...prev, error: '', form: nextForm };
        });
    };

    const sendOrder = async () => {
        const lockedY = window.scrollY;

        if (localStorage.getItem('rikon_bot_banned') === 'true') {
            setOrderState(o => ({ ...o, error: 'تم حظر هذا الجهاز بسبب نشاط مشبوه.' }));
            freezeScroll(lockedY);
            return;
        }

        if (orderState.form.honeypot && orderState.form.honeypot.trim() !== '') {
            localStorage.setItem('rikon_bot_banned', 'true');
            setOrderState(o => ({ ...o, error: 'تم حظر الطلب تلقائياً.' }));
            freezeScroll(lockedY);
            return;
        }

        const { fullname, phone, wilaya, commune, address } = orderState.form;
        const newMissing = {
            size: !selectedSize,
            fullname: !fullname.trim(),
            phone: !phone.trim() || phone.trim().length < 9,
            wilaya: !wilaya,
            commune: !commune,
            address: !address.trim()
        };

        if (Object.values(newMissing).some(Boolean)) {
            setMissingFields(newMissing);
            const missingLabels = [];
            if (newMissing.size) missingLabels.push('المقاس');
            if (newMissing.fullname) missingLabels.push('الاسم الكامل');
            if (newMissing.phone) missingLabels.push('رقم الهاتف');
            if (newMissing.wilaya) missingLabels.push('الولاية');
            if (newMissing.commune) missingLabels.push('البلدية');
            if (newMissing.address) missingLabels.push('العنوان');

            setOrderState(o => ({
                ...o,
                error: `يرجى ملء الخانات الحمراء المطلوبة: (${missingLabels.join(' ، ')})`
            }));
            freezeScroll(lockedY);
            return;
        }

        if (!isAdmin && Date.now() - formOpenTimestamp.current < 2000) {
            localStorage.setItem('rikon_bot_banned', 'true');
            return;
        }

        if (!checkRateLimit()) {
            setOrderState(o => ({
                ...o,
                error: 'لقد أرسلت 3 طلبات بالفعل. يرجى الانتظار 15 دقيقة قبل إرسال طلب جديد.'
            }));
            freezeScroll(lockedY);
            return;
        }

        setOrderState(o => ({ ...o, error: '', sending: true }));
        freezeScroll(lockedY);

        try {
            const deliveryLabel = orderState.form.deliveryType === 'stopDesk' ? 'Stop Desk' : 'Domicile';
            const { error } = await supabase
                .from('messages')
                .insert({
                    fullname: fullname.trim(),
                    email: 'no-email@rikonstore.dz',
                    phone: phone.trim(),
                    address: `${address.trim()} (${deliveryLabel})`,
                    city: commune,
                    wilaya,
                    product_name: product.name,
                    product_price: `${Number(product.price).toFixed(2)}`,
                    category: product.category,
                    size: selectedSize,
                    quantity,
                    total_price: `${finalTotal.toFixed(2)}`,
                    ordered_at: new Date().toLocaleString(),
                    is_checked: false,
                    is_read: false,
                });

            if (!error) {
                setOrderState({
                    form: EMPTY_ORDER,
                    sending: false,
                    sent: true,
                    error: ''
                });
                setMissingFields({});
                
                // Force viewport to stay locked to lockedY even after DOM updates
                setTimeout(() => {
                    window.scrollTo({ top: lockedY, behavior: 'instant' });
                }, 0);
            } else {
                console.error(error);
                setOrderState(o => ({ ...o, error: 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.', sending: false }));
                freezeScroll(lockedY);
            }
        } catch {
            setOrderState(o => ({ ...o, error: 'حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى.', sending: false }));
            freezeScroll(lockedY);
        }
    };

    if (loading) return <div id="sp2-loading"><div id="sp2-spinner" /></div>;
    if (!product) return <div id="sp2-loading"><p>Product not found</p></div>;

    return (
        <div id="sp2-wrap">
            <div id="sp2-top-bar">
                <button type="button" id="sp2-back" onClick={onBack}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    BACK
                </button>
            </div>

            <div id="sp2-inner">
                {/* YOUNGLA FULL-WIDTH SWIPEABLE IMAGE GALLERY[cite: 2] */}
                <div id="sp2-gallery-section">
                    <div
                        id="sp2-img-track"
                        ref={galleryRef}
                        onScroll={handleGalleryScroll}
                        className={allImages.length > 1 ? 'multi-img' : 'single-img'}
                    >
                        {allImages.map((imgObj, index) => (
                            <div className="sp2-img-slide" key={imgObj.id || index}>
                                <img
                                    src={imgObj.image_url || product.image_url}
                                    alt={`${product.name} ${index + 1}`}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                />
                            </div>
                        ))}
                    </div>

                    {allImages.length > 1 && (
                        <div className="sp2-img-dots">
                            {allImages.map((_, i) => (
                                <span
                                    key={i}
                                    className={`sp2-img-dot${i === currentImg ? ' active' : ''}`}
                                />
                            ))}
                        </div>
                    )}

                    {isAdmin && (
                        <div className="sp2-img-toolbar">
                            <label className="sp2-admin-pill">
                                + Add Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={e => addImage(e.target.files[0])}
                                />
                            </label>
                            {currentImg > 0 && (
                                <button type="button" className="sp2-admin-pill danger" onClick={deleteCurrentImage}>
                                    Delete Slide #{currentImg + 1}
                                </button>
                            )}
                            <span className="sp2-img-counter">
                                {currentImg + 1} / {allImages.length}
                            </span>
                        </div>
                    )}
                </div>

                {/* PRODUCT INFO + INLINE CHECKOUT */}
                <div id="sp2-details">
                    {product.category && (
                        <div id="sp2-cat-badge">{product.category}</div>
                    )}
                    <h1 id="sp2-name">{product.name}</h1>
                    <p id="sp2-price">{Number(product.price).toFixed(2)} DZD</p>

                    <div className="sp2-divider" />

                    <div id="sp2-desc">
                        {product.description ? (
                            <p className="sp2-desc-bold">{product.description}</p>
                        ) : (
                            <p className="sp2-desc-empty">No description yet</p>
                        )}
                        {isAdmin && (
                            <button
                                type="button"
                                id="sp2-editdesc"
                                onClick={() => {
                                    setDescEdit({ show: true, draft: product.description || '' });
                                    document.body.style.overflow = 'hidden';
                                }}
                            >
                                {product.description ? 'Edit Description' : '+ Add Description'}
                            </button>
                        )}
                    </div>

                    {/* SIZES[cite: 3] */}
                    <div id="sp2-sizes" className={missingFields.size ? 'sp2-sizes-error' : ''}>
                        <div className="sp2-label-row">
                            <span id="sp2-size-label">اختر المقاس / Size: *</span>
                            {selectedSize ? (
                                <span className="sp2-selected-val">{selectedSize}</span>
                            ) : (
                                missingFields.size && <span className="sp2-missing-inline">يرجى اختيار المقاس!</span>
                            )}
                        </div>

                        {isAdmin && (
                            <div className="size-add-row">
                                <input
                                    className="size-add-input"
                                    type="text"
                                    placeholder="Add size e.g. S, M, L, XL"
                                    value={newSize}
                                    onChange={e => setNewSize(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addSize()}
                                />
                                <button type="button" className="size-add-btn" onClick={addSize}>
                                    ADD
                                </button>
                            </div>
                        )}

                        <div id="sp2-size-grid">
                            {sizes.map(row => (
                                <div key={row.id} className="sp2-size-cell">
                                    <button
                                        type="button"
                                        className={`sp2-size-btn${!row.available ? ' unavailable' : ''}${selectedSize === row.size ? ' selected' : ''}${missingFields.size ? ' btn-error-border' : ''}`}
                                        disabled={!row.available}
                                        onClick={() => handleSelectSize(row.size)}
                                    >
                                        {row.size}
                                    </button>
                                    {isAdmin && (
                                        <div className="sp2-size-admin-btns">
                                            <button
                                                type="button"
                                                className="sp2-size-toggle"
                                                onClick={() => toggleSize(row)}
                                                title={row.available ? 'Mark unavailable' : 'Mark available'}
                                            >
                                                {row.available ? '✕' : '✓'}
                                            </button>
                                            <button
                                                type="button"
                                                className="sp2-size-delete"
                                                onClick={() => deleteSize(row)}
                                                title="Delete size"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {sizes.length === 0 && (
                                <p className="no-sizes-yet">
                                    {isAdmin ? 'Add sizes above' : 'Sizes coming soon'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* QUANTITY */}
                    <div id="sp2-quantity">
                        <span id="sp2-qty-label">الكمية / Quantity:</span>
                        <div id="sp2-qty-controls">
                            <button
                                type="button"
                                className="sp2-qty-btn"
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                            >
                                −
                            </button>
                            <span id="sp2-qty-value">{quantity}</span>
                            <button
                                type="button"
                                className="sp2-qty-btn"
                                onClick={() => setQuantity(q => Math.min(10, q + 1))}
                                disabled={quantity >= 10}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="sp2-divider" />

                    {/* INLINE ORDER SECTION */}
                    <div id="sp2-inline-checkout">
                        <h2 className="sp2-checkout-title">معلومات الزبون والتوصيل</h2>
                        <p className="sp2-checkout-sub">
                            يرجى ملء معلوماتك بالأسفل لتأكيد الطلب والدفع عند الاستلام
                        </p>

                        {orderState.sent ? (
                            <div className="sp2-order-success">
                                <div className="sp2-success-icon">✓</div>
                                <h3>تم استلام طلبك بنجاح!</h3>
                                <p>شكراً لثقتك بمتجر RIKON STORE. سنتصل بك قريباً عبر الهاتف لتأكيد الطلبية وإرسالها.</p>
                                <button
                                    type="button"
                                    className="sp2-send-btn"
                                    onClick={() => setOrderState(o => ({ ...o, sent: false }))}
                                >
                                    إرسال طلب آخر
                                </button>
                            </div>
                        ) : (
                            <div className="sp2-form">
                                <input
                                    type="text"
                                    name="company_tax_id"
                                    className="bot-trap-input"
                                    tabIndex="-1"
                                    autoComplete="off"
                                    value={orderState.form.honeypot}
                                    onChange={e => updateForm('honeypot', e.target.value)}
                                />

                                <div className="sp2-field">
                                    <label className={missingFields.fullname ? 'label-error' : ''}>
                                        الاسم واللقب (Nom complet) *
                                    </label>
                                    <input
                                        className={`sp2-input${missingFields.fullname ? ' input-error' : ''}`}
                                        type="text"
                                        placeholder="أدخل اسمك الكامل"
                                        value={orderState.form.fullname}
                                        onChange={e => updateForm('fullname', e.target.value)}
                                    />
                                </div>

                                <div className="sp2-field">
                                    <label className={missingFields.phone ? 'label-error' : ''}>
                                        رقم الهاتف (Numéro de téléphone) *
                                    </label>
                                    <input
                                        className={`sp2-input${missingFields.phone ? ' input-error' : ''}`}
                                        type="tel"
                                        placeholder="05 / 06 / 07 XX XX XX XX"
                                        value={orderState.form.phone}
                                        onChange={e => updateForm('phone', e.target.value)}
                                    />
                                </div>

                                <div className="sp2-field">
                                    <label className={missingFields.wilaya ? 'label-error' : ''}>
                                        الولاية (Wilaya) *
                                    </label>
                                    <select
                                        className={`sp2-input sp2-select${missingFields.wilaya ? ' input-error' : ''}`}
                                        value={orderState.form.wilaya}
                                        onChange={e => updateForm('wilaya', e.target.value)}
                                    >
                                        <option value="">-- اختر الولاية --</option>
                                        {UNIVER_TARIFS.map(w => (
                                            <option key={w.code} value={w.name}>
                                                {w.code} - {w.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sp2-field">
                                    <label className={missingFields.commune ? 'label-error' : ''}>
                                        البلدية (Commune / البلدية) *
                                    </label>
                                    <select
                                        className={`sp2-input sp2-select${missingFields.commune ? ' input-error' : ''}`}
                                        value={orderState.form.commune}
                                        disabled={!orderState.form.wilaya}
                                        onChange={e => updateForm('commune', e.target.value)}
                                    >
                                        <option value="">
                                            {orderState.form.wilaya ? '-- اختر البلدية --' : '-- اختر الولاية أولاً --'}
                                        </option>
                                        {availableCommunes.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedWilayaObj && (
                                    <div className="sp2-delivery-options">
                                        <button
                                            type="button"
                                            className={`sp2-deliv-btn${orderState.form.deliveryType === 'domicile' ? ' active' : ''}`}
                                            onClick={() => updateForm('deliveryType', 'domicile')}
                                        >
                                            <span>توصيل للمنزل (À Domicile)</span>
                                            <strong>{selectedWilayaObj.domicile} DZD</strong>
                                        </button>

                                        {selectedWilayaObj.stopDesk !== null && (
                                            <button
                                                type="button"
                                                className={`sp2-deliv-btn${orderState.form.deliveryType === 'stopDesk' ? ' active' : ''}`}
                                                onClick={() => updateForm('deliveryType', 'stopDesk')}
                                            >
                                                <span>استلام من المكتب (Stop Desk)</span>
                                                <strong>{selectedWilayaObj.stopDesk} DZD</strong>
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="sp2-field">
                                    <label className={missingFields.address ? 'label-error' : ''}>
                                        العنوان بالتفصيل (Adresse) *
                                    </label>
                                    <input
                                        className={`sp2-input${missingFields.address ? ' input-error' : ''}`}
                                        type="text"
                                        placeholder="الحي، الشارع، أو رقم المنزل"
                                        value={orderState.form.address}
                                        onChange={e => updateForm('address', e.target.value)}
                                    />
                                </div>

                                {selectedWilayaObj && (
                                    <div className="sp2-price-summary">
                                        <div className="sp2-summary-row">
                                            <span>سعر المنتج ({quantity}x):</span>
                                            <span>{productSubtotal.toFixed(2)} DZD</span>
                                        </div>
                                        <div className="sp2-summary-row">
                                            <span>التوصيل ({selectedWilayaObj.name}):</span>
                                            <span>{shippingCost.toFixed(2)} DZD</span>
                                        </div>
                                        <div className="sp2-summary-row total">
                                            <span>المبلغ الإجمالي (TOTAL):</span>
                                            <span>{finalTotal.toFixed(2)} DZD</span>
                                        </div>
                                    </div>
                                )}

                                {orderState.error && (
                                    <div className="sp2-error-box">
                                        {orderState.error}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="sp2-send-btn"
                                    disabled={orderState.sending}
                                    onClick={sendOrder}
                                >
                                    {orderState.sending
                                        ? 'جاري إرسال الطلب...'
                                        : selectedWilayaObj
                                        ? `تأكيد الطلب — ${finalTotal.toFixed(2)} DZD`
                                        : 'تأكيد الطلب الآن (SEND ORDER)'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {descEdit.show && (
                <div className="sp2-modal-bg">
                    <div className="sp2-modal">
                        <h2 className="sp2-modal-title">{product.description ? 'Edit Description' : 'Add Description'}</h2>
                        <textarea
                            className="sp2-textarea"
                            placeholder="Write a description..."
                            value={descEdit.draft}
                            onChange={e => setDescEdit(d => ({ ...d, draft: e.target.value }))}
                            rows={5}
                        />
                        <div className="sp2-modal-btns">
                            <button
                                type="button"
                                className="sp2-btn-cancel"
                                onClick={() => {
                                    setDescEdit({ show: false, draft: '' });
                                    document.body.style.overflow = 'auto';
                                }}
                            >
                                Cancel
                            </button>
                            <button type="button" className="sp2-btn-confirm" onClick={saveDesc}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ShopPage2;