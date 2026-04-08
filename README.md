# StayEase - Full Stack Property Booking Platform

## Overview

StayEase is a MERN stack property booking platform built as an end-to-end full stack project.
It supports secure authentication, listings management, booking workflows, and reviews with a
modern, responsive UI.

**Live Demo:** [https://stayease-ifxaals-projects.vercel.app](https://stayease-ifxaals-projects.vercel.app)

## Core Features

- JWT authentication (register, login, protected routes)
- Property listing creation with image upload
- Search, filtering, and sorting for properties
- Booking flow with date validation and availability checks
- Reviews and ratings per property
- User dashboards for `My Bookings` and `My Properties`
- Practical loading, empty, and error states

## Tech Stack

- Frontend: React, React Router, Axios, CSS
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth & tooling: JWT, Multer, Dotenv

## Local Development

### 1) Install dependencies

From repo root:

- `cd server && npm install`
- `cd ../client && npm install`

### 2) Configure backend environment

Create `server/.env`:

- `MONGO_URI=your_mongodb_connection_string`
- `JWT_SECRET=your_secret_key`
- `PORT=5000`

### 3) Run locally

- Backend: `cd server && npm run dev` (or `npm start`)
- Frontend: `cd client && npm start`

Local URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Properties
- `GET /api/properties`
- `POST /api/properties`
- `GET /api/properties/:id`
- `DELETE /api/properties/:id`

### Bookings
- `POST /api/bookings`
- `GET /api/bookings/my`
- `GET /api/bookings/property/:propertyId`

### Reviews
- `POST /api/reviews`
- `GET /api/reviews/property/:propertyId`

## Deployment

This project includes a Vercel-ready configuration:

- `vercel.json` for SPA and API routing
- Serverless API entry at `api/[...path].js`
- Shared Express app setup in `server/app.js`

Required Vercel environment variables:

- `MONGO_URI`
- `JWT_SECRET`
