import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import evrlinklogo from '../../public/images/g-Logo.png';
import bell from '../../public/images/Bell.png';
import wallet from '../../public/images/Frame 14.png';
import { useWallet } from '@/contexts/WalletContext';

const MyGalleryNewUser = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showWalletAddress, setShowWalletAddress] = useState(false);
  const { address, disconnect } = useWallet();
  const [walletAddress, setWalletAddress] = useState('');
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    // Get wallet address from localStorage or context
    const storedAddress = address || localStorage.getItem('walletAddress');
    if (storedAddress) {
      setWalletAddress(storedAddress);
    }
  }, [address]);
  
  useEffect(() => {
    // Set initial desktop state
    setIsDesktop(window.innerWidth >= 1024);
    
    // Handle resize events
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Function to abbreviate wallet address for display
  const abbreviateAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const toggleWalletAddressDisplay = () => {
    setShowWalletAddress(!showWalletAddress);
  };

  const handleLogout = () => {
    // Clear localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('userEmail');
    
    // Disconnect wallet if connected
    if (disconnect) {
      disconnect();
    } else {
      // If disconnect function is not available, force redirect
      window.location.href = '/';
    }
  };

  // SVG content shortened for brevity
  const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" width="157" height="153" viewBox="0 0 157 153" fill="none">
  <g filter="url(#filter0_dd_527_2240)">
    <path d="M-75.7355 158.346C-72.1171 160.017 -66.4276 158.418 -66.4276 158.418C-66.4276 158.418 -68.5739 159.879 -66.8221 168.839C-65.2174 177.046 -61.6555 181.79 -55.6059 187.079C-51.7941 190.412 -45.7795 193.144 -45.7795 193.144C-45.7795 193.144 -51.1955 202.774 -39.379 210.718C-27.5626 218.663 -20.6211 208.216 -20.6211 208.216L-10.244 213.759C-10.244 213.759 -14.0222 225.418 -1.25895 231.081C7.76332 235.083 17.7106 228.692 17.7106 228.692C17.7106 228.692 32.6805 238.929 42.9784 235.915C50.3771 233.749 56.685 225.543 56.685 225.543C56.685 225.543 64.8258 238.33 72.3973 236.386C77.8464 234.986 80.198 226.004 80.9949 220.291C82.7261 207.877 81.1964 192.905 81.1964 192.905C81.1964 192.905 104.936 161.234 115.773 134.63C119.856 124.606 123.656 114.98 120.665 104.578C118.762 97.9613 111.323 92.5106 111.323 92.5106C111.323 92.5106 122.601 82.6092 115.418 72.1049C104.274 55.8076 82.9503 69.188 82.9503 69.188L48.2046 51.1713C48.2046 51.1713 49.5215 40.3579 47.5945 33.9685C44.5362 23.8273 35.1881 17.9323 24.6817 19.2792C14.5581 20.5771 10.5756 36.514 10.5756 36.514C10.5756 36.514 -1.33618 39.65 -7.9097 43.774C-17.0393 49.5013 -19.555 55.3503 -25.5144 64.3297C-31.4743 73.3088 -33.9924 79.3089 -39.0723 89.8818C-44.0232 100.187 -54.8952 125.108 -54.8952 125.108C-54.8952 125.108 -61.6304 129.485 -66.1293 132.718C-69.6983 135.283 -73.8292 138.132 -77.3624 141.689C-85.6654 150.047 -81.2394 155.804 -75.7355 158.346Z" fill="white"/>
    <path d="M-75.7355 158.346C-72.1171 160.017 -66.4276 158.418 -66.4276 158.418C-66.4276 158.418 -68.5739 159.879 -66.8221 168.839C-65.2174 177.046 -61.6555 181.79 -55.6059 187.079C-51.7941 190.412 -45.7795 193.144 -45.7795 193.144C-45.7795 193.144 -51.1955 202.774 -39.379 210.718C-27.5626 218.663 -20.6211 208.216 -20.6211 208.216L-10.244 213.759C-10.244 213.759 -14.0222 225.418 -1.25895 231.081C7.76332 235.083 17.7106 228.692 17.7106 228.692C17.7106 228.692 32.6805 238.929 42.9784 235.915C50.3771 233.749 56.685 225.543 56.685 225.543C56.685 225.543 64.8258 238.33 72.3973 236.386C77.8464 234.986 80.198 226.004 80.9949 220.291C82.7261 207.877 81.1964 192.905 81.1964 192.905C81.1964 192.905 104.936 161.234 115.773 134.63C119.856 124.606 123.656 114.98 120.665 104.578C118.762 97.9612 111.323 92.5106 111.323 92.5106C111.323 92.5106 122.601 82.6092 115.418 72.1049C104.274 55.8076 82.9502 69.188 82.9502 69.188L48.2046 51.1713C48.2046 51.1713 49.5215 40.3579 47.5945 33.9685C44.5362 23.8273 35.1881 17.9323 24.6817 19.2792C14.5581 20.5771 10.5756 36.514 10.5756 36.514C10.5756 36.514 -1.33618 39.6499 -7.9097 43.774C-17.0393 49.5013 -19.555 55.3503 -25.5144 64.3297C-31.4743 73.3088 -33.9924 79.3089 -39.0723 89.8818C-44.0232 100.187 -54.8952 125.108 -54.8952 125.108C-54.8952 125.108 -61.6304 129.485 -66.1293 132.718C-69.6983 135.283 -73.8292 138.132 -77.3624 141.689C-85.6654 150.047 -81.2394 155.804 -75.7355 158.346Z" stroke="white"/>
  </g>
  <path d="M27.9051 26.1566C11.7034 26.3593 12.5834 44.6468 12.5834 44.6468C12.5834 44.6468 21.4024 46.4252 27.1983 48.3728C33.6869 50.5531 43.4592 55.6407 43.4592 55.6407C43.4592 55.6407 48.8152 25.8951 27.9051 26.1566Z" fill="#00B2C7"/>
  <path d="M109.918 71.8715C119.512 80.9852 105.469 93.4492 105.469 93.4492C105.469 93.4492 97.1236 87.5063 91.6394 83.6688C86.6398 80.1705 78.2367 75.6362 78.2367 75.6362C78.2367 75.6362 99.4454 61.9223 109.918 71.8715Z" fill="#00B2C7"/>
  <path d="M63.2296 66.5315C59.4176 64.4952 22.7437 40.3704 6.49635 43.3044C-13.0238 46.829 -25.7866 74.6933 -36.1178 94.0337C-47.3169 115 -47.5478 119.508 -54.4206 135.432C-59.8563 148.026 -65.2285 159.719 -60.3627 172.544C-58.2653 178.073 -52.5003 184.37 -45.7424 187.98L-45.6052 188.053C-12.2532 205.869 -1.86802 211.416 25.459 224.379C29.3265 226.213 37.7504 228.125 41.926 227.184C50.0275 225.359 57.308 216.973 62.1462 210.224C77.1011 189.362 83.6168 182.77 96.1754 159.259C105.441 141.914 114.005 127.41 114.962 111.861C115.472 103.568 106.828 93.3705 101.277 89.5787C79.3387 74.5934 68.1004 69.1336 63.2296 66.5315Z" fill="#00B2C7" stroke="#008A9A"/>
  <path d="M22.8909 112.491C22.8909 112.491 22.5199 118.282 25.4848 119.865C27.7602 121.081 32.0092 120.901 32.0092 120.901M32.0092 120.901C32.0092 120.901 33.885 125.516 36.4683 126.821C39.984 128.598 46.3983 125.048 46.3983 125.048M32.0092 120.901L33.9179 117.837" stroke="black" stroke-width="3" stroke-linecap="round"/>
  <path d="M-11.0694 101.253C-9.62889 99.4189 -4.56626 99.6907 -1.49775 102.037C1.05844 103.99 3.96258 106.679 2.79647 109.818C1.99819 111.968 -2.86445 111.569 -5.9443 110.361C-9.89381 108.811 -13.1515 103.906 -11.0694 101.253Z" fill="#F58D88"/>
  <path d="M58.1679 138.783C59.6084 136.948 64.671 137.22 67.7396 139.566C70.2957 141.519 73.1999 144.208 72.0338 147.347C71.2355 149.497 66.3729 149.099 63.293 147.89C59.3435 146.34 56.0858 141.435 58.1679 138.783Z" fill="#F58D88"/>
  <path d="M10.3136 144.7C-7.64578 140.673 -17.8535 129.815 -32.2394 141.296C-38.9964 146.688 -42.2251 153.643 -43.9164 160.101C-46.3588 169.428 -36.5813 174.906 -32.5875 178.13C-31.9355 178.656 -21.1511 184.239 -19.6687 185.031C-8.02088 191.253 -15.7615 189.004 -5.12769 195.519C1.53894 199.603 3.90965 198.987 8.35571 201.362C9.7615 202.113 14.464 204.402 15.7667 205.32C17.3497 206.437 18.5183 208.326 20.0739 208.981C31.2597 213.693 40.9968 212.328 47.861 202.318C56.861 189.192 49.6212 167.053 35.6974 159.346C32.3793 157.51 30.3494 157.884 27.4229 155.472C25.0605 153.525 23.2069 150.954 20.7201 149.169C17.9678 147.192 13.6202 145.441 10.3136 144.7Z" fill="#FAFAFA"/>
  <path d="M16.1505 31.8561C20.7019 25.849 27.3682 26.1435 27.3682 26.1435C27.3682 26.1435 20.8858 30.468 18.6629 34.287C17.2352 36.7396 15.9452 43.4514 15.9452 43.4514L12.6264 43.0396C12.6264 43.0396 2.63659 44.9247 -0.788842 48.1228C-10.8339 57.5014 -13.7519 63.7273 -20.2267 75.8486C-30.5212 95.1204 -39.8165 111.659 -48.5734 133.658C-51.7562 141.654 -53.4167 146.285 -54.9427 154.754C-55.8008 159.518 -57.2088 162.306 -56.349 167.069C-55.0377 174.333 -51.6696 178.824 -45.1591 182.301C-22.2871 194.519 -10.9709 200.292 10.8634 211.955C22.7229 218.29 27.2823 221.985 37.4922 224.274C41.0802 225.078 46.7986 225.707 46.7986 225.707C46.7986 225.707 39.8878 229.471 31.3045 226.685C27.0003 225.288 20.5735 222.314 20.5735 222.314L-5.29231 209.586L-19.8063 202.105L-41.4077 190.566C-41.4077 190.566 -49.6442 186.648 -53.6474 182.395C-58.1037 177.66 -60.5347 174.905 -62.0552 167.56C-62.779 164.064 -62.0762 156.388 -62.0762 156.388C-62.0762 156.388 -59.9752 148.44 -58.1838 143.496C-56.118 137.794 -52.1492 129.57 -52.1492 129.57C-52.1492 129.57 -43.9508 105.64 -27.9592 78.2511C-21.6241 66.3915 -13.2838 51.8298 0.323475 45.1783C7.50798 41.6665 12.6264 43.0396 12.6264 43.0396C12.6264 43.0396 12.92 36.1191 16.1505 31.8561Z" fill="black" fill-opacity="0.15"/>
  <path d="M82.925 77.0528L79.1939 75.0597C79.1939 75.0597 82.5733 72.9984 85.7531 71.7583C91.9552 68.8106 97.3365 68.4186 97.3365 68.4186C97.3365 68.4186 91.8952 71.2946 88.5062 73.2289C86.0619 74.6241 82.925 77.0528 82.925 77.0528Z" fill="black" fill-opacity="0.15"/>
  <path d="M1.81166 101.503C-2.14141 99.6079 -3.43678 95.0658 -1.67032 91.2055C0.153259 87.2189 4.8932 85.4206 8.85445 87.2998C12.6399 89.0954 14.2868 93.3799 12.7742 97.2876C11.1181 101.565 5.94778 103.486 1.81166 101.503Z" fill="black"/>
  <path d="M11.1307 96.6727C9.14833 99.8815 3.38515 99.0916 3.38515 99.0916C3.38515 99.0916 0.806574 96.4229 0.00577473 93.9187C-0.623071 91.9528 0.638848 89.674 2.70793 89.3768C6.22368 88.8725 6.59847 92.747 6.59847 92.747C6.59847 92.747 9.07984 91.5801 10.2387 92.35C11.5782 93.2402 11.976 95.3043 11.1307 96.6727Z" fill="#EA173A" stroke="black" stroke-width="0.684195"/>
  <path d="M2.50532 94.1491C3.13395 94.6936 4.08496 94.6254 4.62945 93.9967C5.17395 93.3681 5.10574 92.4171 4.47711 91.8726C3.84848 91.3281 2.89747 91.3963 2.35297 92.025C1.80848 92.6536 1.87669 93.6046 2.50532 94.1491Z" fill="white"/>
  <path d="M4.21779 97.3962C4.50353 97.6437 4.93581 97.6127 5.18331 97.327C5.43081 97.0412 5.3998 96.609 5.11405 96.3615C4.82831 96.114 4.39605 96.145 4.14855 96.4307C3.90105 96.7165 3.93204 97.1487 4.21779 97.3962Z" fill="white"/>
  <path d="M7.45707 95.906C7.84296 96.2402 8.42675 96.1983 8.761 95.8124C9.09524 95.4265 9.05336 94.8428 8.66747 94.5085C8.28157 94.1743 7.6978 94.2161 7.36355 94.602C7.02931 94.9879 7.07117 95.5717 7.45707 95.906Z" fill="white"/>
  <path d="M63.8379 126.059C65.7628 122.093 70.7457 120.586 74.6156 122.699C78.0877 124.594 79.6113 128.415 78.2825 132.141C76.7414 136.461 71.456 138.34 67.3199 136.357C63.3668 134.461 61.984 129.878 63.8379 126.059Z" fill="black"/>
  <path d="M76.7821 131.743C74.7997 134.952 69.0365 134.162 69.0365 134.162C69.0365 134.162 66.4579 131.493 65.6571 128.989C65.0283 127.023 66.2902 124.744 68.3593 124.447C71.875 123.943 72.2498 127.817 72.2498 127.817C72.2498 127.817 74.7312 126.65 75.8901 127.42C77.2296 128.31 77.6274 130.374 76.7821 131.743Z" fill="#EA173A" stroke="black" stroke-width="0.684195"/>
  <path d="M68.1567 129.218C68.7853 129.763 69.7363 129.695 70.2808 129.066C70.8253 128.437 70.7571 127.486 70.1285 126.942C69.4998 126.397 68.5488 126.466 68.0043 127.094C67.4598 127.723 67.5281 128.674 68.1567 129.218Z" fill="white"/>
  <path d="M69.8692 132.465C70.1549 132.713 70.5872 132.682 70.8347 132.396C71.0822 132.11 71.0512 131.678 70.7654 131.431C70.4797 131.183 70.0474 131.214 69.7999 131.5C69.5524 131.786 69.5834 132.218 69.8692 132.465Z" fill="white"/>
  <path d="M73.1084 130.975C73.4943 131.309 74.0781 131.267 74.4124 130.882C74.7466 130.496 74.7047 129.912 74.3188 129.578C73.9329 129.243 73.3492 129.285 73.0149 129.671C72.6807 130.057 72.7225 130.641 73.1084 130.975Z" fill="white"/>
  <path d="M21.0945 176.848C15.7505 184.189 0.109438 183.616 0.109438 183.616C0.109438 183.616 -3.64227 174.367 -5.10804 168.209C-6.25871 163.376 -2.81438 158.136 2.20577 157.8C10.7372 157.23 10.9307 166.599 10.9307 166.599C10.9307 166.599 17.0997 164.25 19.7409 166.309C22.7934 168.69 23.3732 173.718 21.0945 176.848Z" fill="#EA173A"/>
  <defs>
    <filter id="filter0_dd_527_2240" x="-106.463" y="10.5889" width="252.699" height="266.498" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="4"/>
      <feGaussianBlur stdDeviation="3"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.0627451 0 0 0 0 0.0980392 0 0 0 0 0.156863 0 0 0 0.03 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_527_2240"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="16"/>
      <feGaussianBlur stdDeviation="12"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.0627451 0 0 0 0 0.0980392 0 0 0 0 0.156863 0 0 0 0.08 0"/>
      <feBlend mode="normal" in2="effect1_dropShadow_527_2240" result="effect2_dropShadow_527_2240"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_527_2240" result="shape"/>
    </filter>
  </defs>
</svg>`;

  const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" width="157" height="153" viewBox="0 0 157 153" fill="none">
  <g filter="url(#filter0_dd_527_2271)">
    <path d="M91.0692 233.544C94.4699 231.465 96.3043 225.847 96.3043 225.847C96.3043 225.847 96.3252 228.443 104.747 231.969C112.46 235.198 118.384 234.875 126.144 232.787C131.034 231.472 136.648 227.992 136.648 227.992C136.648 227.992 141.641 237.847 154.814 232.442C167.987 227.038 163.163 215.46 163.163 215.46L173.54 209.916C173.54 209.916 181.131 219.539 192.933 212.078C201.277 206.805 201.495 194.983 201.495 194.983C201.495 194.983 218.327 188.232 221.547 177.996C223.86 170.642 220.546 160.837 220.546 160.837C220.546 160.837 235.701 161.18 238.295 153.805C240.161 148.498 234.003 141.549 229.697 137.711C220.341 129.37 207.046 122.317 207.046 122.317C207.046 122.317 193.92 84.9763 177.832 61.1775C171.77 52.2107 165.882 43.7 155.573 40.403C149.015 38.3054 140.349 41.4584 140.349 41.4584C140.349 41.4584 138.389 26.5791 125.664 26.7095C105.922 26.9115 105.188 52.0747 105.188 52.0747L70.8951 70.9381C70.8951 70.9381 62.6392 63.8314 56.2569 61.8807C46.1273 58.7844 36.0301 63.2769 31.3082 72.7587C26.7584 81.8949 37.7909 94.0658 37.7909 94.0658C37.7909 94.0658 33.7747 105.71 33.5478 113.467C33.2324 124.24 36.6958 129.583 40.8456 139.529C44.9954 149.475 48.5827 154.904 54.5464 165.004C60.3591 174.849 75.0293 197.742 75.0293 197.742C75.0293 197.742 74.9226 205.773 75.1082 211.31C75.2558 215.703 75.3275 220.72 76.3195 225.635C78.6506 237.183 85.8961 236.705 91.0692 233.544Z" fill="white"/>
    <path d="M91.0692 233.544C94.4699 231.465 96.3043 225.847 96.3043 225.847C96.3043 225.847 96.3252 228.443 104.746 231.969C112.46 235.198 118.384 234.875 126.144 232.787C131.034 231.472 136.648 227.992 136.648 227.992C136.648 227.992 141.641 237.847 154.814 232.442C167.987 227.038 163.163 215.46 163.163 215.46L173.54 209.916C173.54 209.916 181.131 219.539 192.933 212.078C201.277 206.805 201.495 194.983 201.495 194.983C201.495 194.983 218.327 188.232 221.547 177.996C223.86 170.642 220.546 160.837 220.546 160.837C220.546 160.837 235.701 161.18 238.295 153.805C240.161 148.498 234.003 141.549 229.697 137.711C220.341 129.37 207.046 122.317 207.046 122.317C207.046 122.317 193.92 84.9763 177.832 61.1775C171.77 52.2107 165.882 43.7 155.573 40.403C149.015 38.3054 140.349 41.4584 140.349 41.4584C140.349 41.4584 138.389 26.5791 125.664 26.7095C105.922 26.9115 105.188 52.0747 105.188 52.0747L70.895 70.9381C70.895 70.9381 62.6392 63.8314 56.2569 61.8807C46.1273 58.7844 36.0301 63.2769 31.3082 72.7587C26.7584 81.8949 37.7909 94.0658 37.7909 94.0658C37.7909 94.0658 33.7747 105.71 33.5478 113.467C33.2324 124.24 36.6958 129.583 40.8456 139.529C44.9954 149.475 48.5827 154.904 54.5464 165.004C60.3591 174.849 75.0293 197.742 75.0293 197.742C75.0293 197.742 74.9226 205.773 75.1082 211.31C75.2558 215.703 75.3275 220.72 76.3195 225.635C78.6506 237.183 85.8961 236.705 91.0692 233.544Z" stroke="white"/>
  </g>
  <path d="M38.6564 74.5333C29.817 88.1127 45.5067 97.5487 45.5067 97.5487C45.5067 97.5487 51.8881 91.2073 56.7293 87.4726C62.1492 83.2915 71.8112 77.9975 71.8112 77.9975C71.8112 77.9975 50.0647 57.0075 38.6564 74.5333Z" fill="#00B2C7"/>
  <path d="M122.252 31.7823C135.161 28.8754 137.714 47.4771 137.714 47.4771C137.714 47.4771 128.134 51.1099 121.895 53.5348C116.207 55.7454 107.767 60.209 107.767 60.209C107.767 60.209 108.159 34.9557 122.252 31.7823Z" fill="#00B2C7"/>
  <path d="M91.8548 67.6194C88.0428 69.6557 47.6004 86.7258 41.0058 101.862C33.0826 120.046 49.1473 146.147 59.4789 165.487C70.6794 186.453 74.298 189.151 83.7126 203.717C91.1587 215.237 97.8909 226.203 111.257 229.29C117.018 230.62 125.457 229.329 132.215 225.719L132.352 225.646C165.704 207.829 176.089 202.282 202.057 186.775C205.732 184.58 212.004 178.641 213.544 174.647C216.531 166.898 213.608 156.184 210.689 148.411C201.663 124.381 199.806 115.3 187.247 91.7902C177.981 74.4446 170.687 59.2623 158.294 49.8222C151.685 44.7875 138.403 46.3029 132.165 48.8088C107.512 58.7119 96.7257 65.0175 91.8548 67.6194Z" fill="#00B2C7" stroke="#008A9A"/>
  <path d="M107.629 126.702C107.629 126.702 112.235 130.229 115.2 128.646C117.475 127.43 119.688 123.798 119.688 123.798M119.688 123.798C119.688 123.798 124.567 124.805 127.088 123.383C130.52 121.449 131.136 114.144 131.136 114.144M119.688 123.798L118.203 120.508" stroke="black" stroke-width="3" stroke-linecap="round"/>
  <path d="M78.1887 146.499C77.5513 144.391 80.907 140.311 84.7566 138.919C87.9623 137.76 91.9961 136.675 93.889 139.201C95.1852 140.931 91.8476 144.782 88.9382 146.747C85.2065 149.267 79.1097 149.547 78.1887 146.499Z" fill="#F58D88"/>
  <path d="M147.857 109.672C147.22 107.564 150.575 103.484 154.425 102.092C157.631 100.932 161.664 99.8472 163.557 102.374C164.853 104.104 161.516 107.955 158.607 109.919C154.875 112.439 148.778 112.72 147.857 109.672Z" fill="#F58D88"/>
  <path d="M86.776 138.113C83.0033 140.346 78.5361 139.042 76.2808 135.283C75.2444 133.555 74.8378 131.702 75.072 129.963C75.3181 128.137 76.5479 128.189 77.8705 126.539C79.0138 125.112 80.0485 123.865 81.2069 123.612C84.2156 122.954 87.4829 124.009 89.3669 126.658C92.0264 130.395 90.7238 135.778 86.776 138.113Z" fill="black"/>
  <path d="M82.363 129.853C80.8057 128.644 80.6146 126.085 82.1195 124.811C83.5502 123.6 85.7892 124.007 86.8654 125.543C87.8352 126.927 87.7258 128.748 86.4447 129.851C85.2362 130.89 83.6214 130.831 82.363 129.853Z" fill="white"/>
  <path d="M80.3611 135.278C79.8282 134.572 79.811 133.554 80.515 133.018C81.3077 132.414 82.5579 132.985 82.9024 133.92C83.1772 134.667 83.012 135.495 82.3106 135.87C81.6088 136.245 80.84 135.913 80.3611 135.278Z" fill="white"/>
  <path d="M141.672 100.21C139.547 96.6688 140.07 92.602 143.332 90.0681C144.528 89.1385 146.015 89.2833 147.431 89.1058C148.953 88.9152 150.408 88.459 151.787 89.1068C152.94 89.648 153.97 90.4771 154.759 91.5856C157.418 95.323 156.115 100.706 152.168 103.042C148.394 105.273 143.927 103.97 141.672 100.21Z" fill="black"/>
  <path d="M147.755 94.7824C146.198 93.5731 146.007 91.0141 147.512 89.7405C148.943 88.5285 151.182 88.936 152.258 90.4717C153.228 91.8557 153.118 93.6772 151.837 94.7797C150.629 95.8194 149.014 95.7601 147.755 94.7824Z" fill="white"/>
  <path d="M145.754 100.207C145.221 99.5011 145.203 98.4837 145.907 97.9476C146.7 97.3438 147.95 97.9146 148.295 98.8499C148.57 99.5965 148.405 100.424 147.703 100.799C147.001 101.174 146.233 100.843 145.754 100.207Z" fill="white"/>
  <path d="M126.838 149.921C113.507 162.61 102.699 166.9 100.35 183.398C99.1312 191.956 105.63 203.705 110.058 208.7C116.452 215.916 126.441 210.835 131.342 209.308C132.142 209.058 142.778 203.199 144.26 202.407C155.908 196.184 149.735 201.368 161.062 196.151C168.164 192.881 168.97 190.568 173.415 188.193C174.822 187.441 179.339 184.806 180.826 184.234C182.634 183.538 184.854 183.617 186.263 182.689C196.399 176.011 200.679 167.159 196.175 155.888C190.269 141.11 167.273 129.677 153.125 136.965C149.754 138.702 148.937 140.597 145.305 141.689C142.373 142.57 139.205 142.681 136.338 143.756C133.166 144.944 129.293 147.584 126.838 149.921Z" fill="#FAFAFA"/>
  <path d="M36.8579 87.4722C34.3953 80.3492 38.3464 74.9719 38.3464 74.9719C38.3464 74.9719 38.3368 82.7644 40.2752 86.7354C41.52 89.2857 46.3816 94.0896 46.3816 94.0896L44.1942 96.6192C44.1942 96.6192 40.2069 105.971 40.9607 110.596C43.1712 124.16 46.7237 130.047 53.199 142.168C63.494 161.439 72.0731 178.361 85.4895 197.87C90.366 204.961 93.2921 208.917 99.4833 214.894C102.966 218.255 104.5 220.976 108.937 222.909C115.704 225.858 121.31 225.555 127.82 222.077C150.692 209.859 161.781 203.663 183.615 191.999C195.475 185.663 201.081 183.928 208.66 176.714C211.323 174.179 215.025 169.775 215.025 169.775C215.025 169.775 214.312 177.613 207.224 183.198C203.669 185.999 197.624 189.687 197.624 189.687L172.664 204.11L158.376 212.015L136.775 223.554C136.775 223.554 128.939 228.222 123.178 229.185C116.765 230.256 113.123 230.745 106.173 227.925C102.865 226.583 96.8752 221.731 96.8752 221.731C96.8752 221.731 91.4372 215.566 88.3234 211.328C84.7327 206.441 80.1037 198.57 80.1037 198.57C80.1037 198.57 64.7713 178.451 50.8968 149.931C44.5614 138.071 37.0949 123.043 39.1316 108.034C40.2071 100.11 44.1942 96.6192 44.1942 96.6192C44.1942 96.6192 38.6051 92.5274 36.8579 87.4722Z" fill="black" fill-opacity="0.15"/>
  <path d="M111.549 57.0988L107.818 59.092C107.818 59.092 107.984 55.137 108.721 51.8045C109.719 45.0104 112.385 40.3196 112.385 40.3196C112.385 40.3196 111.75 46.4414 111.474 50.3337C111.275 53.1411 111.549 57.0988 111.549 57.0988Z" fill="black" fill-opacity="0.15"/>
  <path d="M138.598 87.2139C138.3 87.0803 138.098 86.8231 137.857 86.3711C137.755 86.1809 137.528 85.8928 137.219 86.131C136.909 86.3692 137.106 86.6006 137.208 86.7908C137.449 87.2432 137.553 87.4043 137.896 87.807C139.853 90.1081 143.705 90.2346 147.284 89.8508C151.016 89.4505 154.514 88.5357 156.678 87.8167C156.99 87.7128 157.394 87.6373 157.353 87.3106C157.3 86.9008 156.698 87.0225 156.37 87.1063C153.746 87.7802 151.389 88.2333 148.024 88.51C141.261 89.0658 140.226 87.9452 138.598 87.2139Z" fill="#1A1A1A"/>
  <path d="M82.0647 115.341C81.8438 115.409 81.7987 115.658 81.9076 115.862C81.9981 116.031 82.1544 116.324 82.1576 116.602C82.1934 120.075 80.8527 121.813 78.8966 124.53C76.599 127.721 74.7751 129.351 72.1111 131.72C71.8231 131.976 71.5805 132.134 71.7274 132.362C71.8673 132.579 72.2479 132.52 72.6404 132.165C75.0315 130.001 76.7685 128.722 78.9998 126.221C80.8652 124.13 83.3781 120.971 83.14 117.896C83.0637 116.917 82.8884 116.065 82.5592 115.585C82.4451 115.419 82.285 115.272 82.0647 115.341Z" fill="#1A1A1A"/>
  <path d="M138.598 87.2139C138.3 87.0803 138.098 86.8231 137.857 86.3711C137.755 86.1809 137.528 85.8928 137.219 86.131C136.909 86.3692 137.106 86.6006 137.208 86.7908C137.449 87.2432 137.553 87.4043 137.896 87.807C139.853 90.1081 143.705 90.2346 147.284 89.8508C151.016 89.4505 154.514 88.5357 156.678 87.8167C156.99 87.7128 157.394 87.6373 157.353 87.3106C157.3 86.9008 156.698 87.0225 156.37 87.1063C153.746 87.7802 151.389 88.2333 148.024 88.51C141.261 89.0658 140.226 87.9452 138.598 87.2139Z" stroke="#1A1A1A" stroke-width="0.267354"/>
  <path d="M82.0647 115.341C81.8438 115.409 81.7987 115.658 81.9076 115.862C81.9981 116.031 82.1544 116.324 82.1576 116.602C82.1934 120.075 80.8527 121.813 78.8966 124.53C76.599 127.721 74.7751 129.351 72.1111 131.72C71.8231 131.976 71.5805 132.134 71.7274 132.362C71.8673 132.579 72.2479 132.52 72.6404 132.165C75.0315 130.001 76.7685 128.722 78.9998 126.221C80.8652 124.13 83.3781 120.971 83.14 117.896C83.0637 116.917 82.8884 116.065 82.5592 115.585C82.4451 115.419 82.285 115.272 82.0647 115.341Z" stroke="#1A1A1A" stroke-width="0.267354"/>
  <path d="M85.6487 138.398C90.3985 135.801 90.5284 131.803 90.5284 131.803C90.5284 131.803 87.1654 133.402 84.8905 134.887C82.6873 136.324 80.0226 138.401 80.0226 138.401C80.0226 138.401 83.2702 139.547 85.6487 138.398Z" fill="#81E1FD" stroke="#69BEE5" stroke-width="1.5"/>
  <path d="M151.439 103.454C156.186 100.837 155.679 96.9432 155.679 96.9432C155.679 96.9432 152.846 98.2218 150.579 99.7284C148.383 101.187 145.736 103.31 145.736 103.31C145.736 103.31 149.059 104.604 151.439 103.454Z" fill="#81E1FD" stroke="#69BEE5" stroke-width="1.5"/>
  <path d="M154.456 153.414C154.456 153.414 162.698 149.536 166.438 157.518C171.25 167.792 158.712 170.049 158.712 170.049C158.712 170.049 157.627 173.407 156.007 174.55C152.747 176.85 148.594 174.261 148.594 174.261C148.594 174.261 148.611 178.581 144.635 180.434C142.073 181.628 139.182 180.148 139.182 180.148C139.182 180.148 136.8 184.246 134.002 185.111C129.427 186.526 123.584 183.754 122.186 178.723C120.865 173.968 125 170.583 125 170.583C125 170.583 121.458 167.796 122.555 164.487C123.965 160.239 127.931 160.517 127.931 160.517C127.931 160.517 126.514 156.881 128.732 154.599C132.028 151.206 136.137 153.89 136.137 153.89C136.137 153.89 136.082 149.407 140.498 148.647C144.216 148.008 145.799 150.972 145.799 150.972C145.799 150.972 147.215 149.69 150.072 150.122C152.928 150.554 154.456 153.414 154.456 153.414Z" fill="#CCD0D1" stroke="#CCD0D1" stroke-width="0.175409"/>
  <path d="M124.916 179.364C124.916 179.364 123.589 176.147 124.02 174.112C124.427 172.188 126.713 169.857 126.713 169.857C126.713 169.857 123.728 167.756 124.212 165.176C125.069 160.612 129.367 160.703 129.367 160.703C129.367 160.703 127.774 156.957 130.83 154.861C133.975 152.703 136.506 155.028 136.506 155.028M139.327 150.656C139.327 150.656 141.481 149.505 143.122 150.252C144.2 150.743 145.563 152.051 145.563 152.051C145.563 152.051 148.124 151.148 149.695 151.563C151.752 152.105 153.217 154.313 153.217 154.313C153.217 154.313 157.209 153.156 159.611 153.858C162.327 154.651 163.895 157.586 163.895 157.586M160.578 168.716C160.578 168.716 159.524 169.19 158.804 169.33C158.205 169.446 157.243 169.447 157.243 169.447C157.243 169.447 156.874 171.157 156.24 172.037C155.592 172.933 154.046 173.829 154.046 173.829M135.778 182.537C135.778 182.537 137.19 181.783 137.995 180.876C138.708 180.072 139.554 178.61 139.554 178.61C139.554 178.61 140.961 179.479 141.972 179.563C143.042 179.651 144.65 178.944 144.65 178.944" stroke="#EAEAEA" stroke-width="0.350819" stroke-dasharray="3.51 1.75"/>
  <defs>
    <filter id="filter0_dd_527_2271" x="5.70801" y="18.2085" width="257.431" height="257.771" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="4"/>
      <feGaussianBlur stdDeviation="3"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.0627451 0 0 0 0 0.0980392 0 0 0 0 0.156863 0 0 0 0.03 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_527_2271"/>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="16"/>
      <feGaussianBlur stdDeviation="12"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.0627451 0 0 0 0 0.0980392 0 0 0 0 0.156863 0 0 0 0.08 0"/>
      <feBlend mode="normal" in2="effect1_dropShadow_527_2271" result="effect2_dropShadow_527_2271"/>
      <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_527_2271" result="shape"/>
    </filter>
  </defs>
</svg>`;

  return (
    <div className="min-h-screen bg-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 sticky top-0 h-screen overflow-y-auto">
        <div className="p-4 pb-0">
          <img src={evrlinklogo} alt="Evrlink" className="h-12 mb-4" />
        </div>
        <nav className="p-4 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <span className="material-icons">home</span>
            <span>Home</span>
          </Link>
          <Link
            to="/my-gallery"
            className="flex items-center gap-3 px-4 py-2 text-gray-900 bg-blue-50 rounded-lg"
          >
            <span className="material-icons">collections</span>
            <span>My Gallery</span>
          </Link>
          <Link
            to="/marketplace"
            className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <span className="material-icons">grid_view</span>
            <span>Templates</span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <span className="material-icons">settings</span>
            <span>Settings</span>
          </Link>
          <Link
            to="/faqs"
            className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <span className="material-icons">help</span>
            <span>FAQs</span>
          </Link>
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <button className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg w-full">
            <span className="material-icons">logout</span>
            <span>LogOut</span>
          </button>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 w-full max-w-full overflow-x-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 fixed top-0 w-full lg:w-[calc(100%-16rem)] z-10">
          <div className="px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <span className="material-icons">{isSidebarOpen ? 'close' : 'menu'}</span>
              </button>
              {/* Logo - Mobile Only */}
              <img src={evrlinklogo} alt="Evrlink" className="h-8 lg:hidden" />
            </div>
            {/* Desktop Search - Hidden on Mobile */}
          <div className="hidden lg:block relative mb-8 mt-6 w-full max-w-2xl">
            <span className="absolute inset-y-0 left-3 flex items-center">
              <span className="material-icons text-gray-400">search</span>
            </span>
            <input
              type="text"
              placeholder="Search for a meep or template..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B2C7]"
            />
          </div>
          {/* Mobile Search - Hidden on Desktop */}
          <div className="lg:hidden relative mb-6">
              <span className="absolute inset-y-0 left-3 flex items-center">
                <span className="material-icons text-gray-400">search</span>
              </span>
              <input
                type="text"
                placeholder="Search for a meep or template..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B2C7]"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full relative"
                  onClick={toggleWalletAddressDisplay}
                  title={abbreviateAddress(walletAddress)}
                >
                  <img src={wallet} alt="wallet" className="w-6 h-6" />
                </button>
                
                {showWalletAddress && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Your Wallet</div>
                    <div className="text-xs bg-gray-50 p-2 rounded break-all font-mono">
                      {walletAddress || 'No wallet connected'}
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button 
                        className="text-xs text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          navigator.clipboard.writeText(walletAddress);
                          // Could add toast notification here
                        }}
                      >
                        Copy Address
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <img src={bell} alt="bell" className="w-6 h-6" />
              </button>
              
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center relative group">
                <img src="/avatar.jpg" alt="Profile" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300">
                  <span className="text-white opacity-0 group-hover:opacity-100 text-xs">
                    {abbreviateAddress(walletAddress)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar */}
        <aside 
          className={`fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 p-4 z-30 transition-transform duration-300 lg:hidden ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="space-y-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-2 text-gray-600  hover:bg-gray-50 rounded-lg"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-icons">home</span>
              <span>Home</span>
            </Link>
            <Link
              to="/gallery"
              className="flex items-center gap-3 px-4 py-2 text-gray-900 bg-blue-50 rounded-lg"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-icons">collections</span>
              <span>My Gallery</span>
            </Link>
            <Link
              to="/templates"
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-icons">grid_view</span>
              <span>Templates</span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-icons">settings</span>
              <span>Settings</span>
            </Link>
            <Link
              to="/faqs"
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="material-icons">help</span>
              <span>FAQs</span>
            </Link>
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
            <button
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg w-full"
              onClick={handleLogout}
            >
              <span className="material-icons">logout</span>
              <span>LogOut</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="pt-16 px-4 lg:px-8 bg-white">
          {/* Gallery Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8 mb-8">
            <h1 className="text-2xl font-bold">My Gallery</h1>
            <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
              <div className="flex bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <button className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg focus:outline-none">Created by Me</button>
                <button className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 focus:outline-none">Gifted to Me</button>
              </div>
              <Link to="/marketplace" className="px-5 py-2 rounded-lg bg-[#00B2C7] text-white flex items-center gap-2 font-medium text-sm shadow hover:bg-[#009bb0] transition-colors">
                <span className="material-icons text-base">add</span>
                Create Meep
              </Link>
            </div>
          </div>
          
          {/* Welcome Message */}
          <div className="bg-[#00B2C71A] rounded-xl p-4 lg:p-8 mb-8 relative">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-xl lg:text-2xl font-semibold mb-4">A Meep Welcome ❤️</h1>
              <p className="text-gray-600 mb-2 text-sm lg:text-base">
                We've been thinking of ways to create lasting, meaningful moments for you-and we realized greeting
                cards could be something truly special.
              </p>
              <p className="text-gray-600 mb-2 text-sm lg:text-base">
                This Meep isn't just a card, it's a warm, everlasting welcome, etched into time.
              </p>
              <p className="text-gray-600 mb-2 text-sm lg:text-base">
                We're so thrilled you're here, and we can't wait to share many unforgettable moments together.
                Here's to new beginnings and the people who make life special.
              </p>
              <p className="text-gray-600 text-sm lg:text-base">XOXO, Evrlink</p>
            </div>
            <div className="absolute bottom-0 left-0 hidden md:block">
              <div dangerouslySetInnerHTML={{ __html: svg1 }} />
            </div>
            <div className="absolute bottom-0 right-0 hidden md:block">
              <div dangerouslySetInnerHTML={{ __html: svg2 }} />
            </div>
          </div>

          {/* No Meeps Message */}
          <div className="flex justify-center items-center py-16">
            <p className="text-center text-lg text-gray-800 font-medium max-w-xl">
              You don't have any Meeps yet. Click on the button above to start creating.
            </p>
          </div>

        </main>
      </div>
    </div>
  );
};

export default MyGalleryNewUser; 