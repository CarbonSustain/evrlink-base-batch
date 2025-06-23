# Evrlink Frontend

A modern React + TypeScript frontend for the Evrlink platform, supporting NFT background gifting, direct transfers, and USDC/ETH payments.

---

## Table of Contents

- [File Structure](#file-structure)
- [Environment Setup](#environment-setup)
- [Deployment Guide](#deployment-guide)
- [Configuration Notes](#configuration-notes)
- [Troubleshooting](#troubleshooting)
- [Contact & Support](#contact--support)

---

## File Structure

```
evrlink-base-batch/
├── public/                   # Static assets (favicon, images, etc.)
├── src/
│   ├── assets/               # Project images, SVGs, etc.
│   ├── components/           # React components
│   ├── contexts/             # React context providers
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Page-level components (routes)
│   ├── services/             # API and blockchain service logic
│   ├── styles/               # CSS/SCSS files or style modules
│   ├── utils/                # Utility/helper functions
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point for React
│   └── ...                   # Other source files
├── .env.example              # Example environment variables
├── .env                      # Your environment variables (not committed)
├── package.json              # Project metadata and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
├── README.md                 # This file
└── ...                       # Other config and meta files
```

---

## Environment Setup

1. **Clone the repository:**

   ```bash
   git clone <repo-url>
   cd evrlink-base-batch
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Copy and configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:

   ```
   VITE_API_URL=https://your-deployed-backend-url.com
   VITE_USDC_TOKEN_ADDRESS=your-usdc-token-address
   VITE_CONTRACT_ADDRESS=your-giftcard-contract-address
   ```

   - `VITE_API_URL`: URL of your backend API.
   - `VITE_USDC_TOKEN_ADDRESS`: USDC token contract address (for USDC payments).
   - `VITE_CONTRACT_ADDRESS`: Gift card smart contract address.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173) (or as configured).

---

## Deployment Guide

### AWS S3 + CloudFront

#### Prerequisites

- AWS account with appropriate permissions
- AWS CLI installed and configured
- Node.js and npm installed

#### Steps

1. **Build the application:**

   ```bash
   npm run build
   ```

   This creates a `dist` directory with the production build.

2. **Deploy to S3 (Static Website Hosting):**

   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront (recommended):**

   - Create a CloudFront distribution pointing to your S3 bucket
   - Set up HTTPS with a custom domain
   - Configure cache settings

4. **Environment Variables:**
   - For AWS Amplify or Elastic Beanstalk, set the environment variables in the AWS console
   - For S3 deployments, ensure your `.env` file has the correct values before building

---

## Configuration Notes

- The frontend and backend are designed to be deployed separately.
- The application uses environment variables for API URLs and contract addresses.
- Make sure CORS is properly configured on the backend to allow requests from your frontend domain.
- For local development, the application will default to `http://localhost:3001` if no environment variables are set.

---

## Troubleshooting

- If images or blockchain transactions don't work, check that all environment variables are correctly set.
- Verify that CORS is properly configured on the backend.
- Check browser console for any errors.
- For USDC payments, ensure the wallet has approved the correct USDC allowance for the contract.

---

## Contact & Support

- For questions, onboarding, or handover, please contact the previous maintainer or your team lead.
- Review the code comments and documentation in each module for further details.

---
