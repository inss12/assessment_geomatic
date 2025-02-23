# Geomatic Assessment

This repository contains a full-stack geospatial web mapping application developed for the Geomatic assessment. The project integrates a Python backend using FastAPI to serve geospatial data and a React frontend using the ArcGIS API for JavaScript for interactive mapping. The application demonstrates functionality such as spatial filtering, proximity searches, user-drawn queries, and dynamic data visualization with charts.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Approach and Assumptions](#approach-and-assumptions)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Backend API:**
  - Serves GeoJSON data for provinces and regions.
  - Provides transport station data from CSV with optional filtering based on station type.

- **Interactive Map:**
  - Displays geospatial layers (regions, provinces, transport stations) using ArcGIS API.
  - Includes native ArcGIS widgets (Basemap Gallery, Layer List, Search, Legend) for enhanced usability.

- **Spatial Queries and Filtering:**
  - Filter data by region or province.
  - Perform proximity searches with user-specified radius and transport type.
  - Draw custom query areas with integrated drawing tools.

- **Dynamic Charts:**
  - Uses Chart.js (via react-chartjs-2) to display transport station counts by type.

## Technologies Used

- **Backend:**
  - **Python** with **FastAPI**: Fast and modern web framework to serve API endpoints.
  - **Pandas & NumPy**: Data processing and cleaning for transport station data.
  - **Starlette CORS Middleware**: Enables cross-origin requests from the frontend.

- **Frontend:**
  - **React**: For building an interactive user interface.
  - **ArcGIS API for JavaScript (@arcgis/core)**: For advanced geospatial mapping and layer management.
  - **Chart.js** (via **react-chartjs-2**): For rendering dynamic bar charts.
  - **React Scripts**: Bootstrapping and development server support.

- **Other:**
  - **npm**: Dependency management and scripts.

## Project Structure

```
├── main.py                   # FastAPI backend server
├── data/                     # Data directory containing:
│   ├── provinces.geojson     # GeoJSON data for provinces
│   ├── regions.geojson       # GeoJSON data for regions
│   └── transport_stations.csv# CSV data for transport stations
├── package.json              # Frontend dependencies and scripts
├── public/
│   └── index.html            # HTML entry point for the React app
└── src/
    ├── App.js                # Main React component; integrates MapContainer and Sidebar
    ├── App.css               # Global styles (if any)
    └── components/
        ├── MapContainer.js   # Map component using ArcGIS API; handles layers, queries, and drawing
        ├── MapContainer.css  # Styling for MapContainer
        ├── Sidebar.js        # Sidebar controls for filters, queries, and chart display
        └── Sidebar.css       # Styling for Sidebar
```

## Setup and Installation

### Prerequisites

- **Backend:**
  - Python 3.7+
  - Recommended: [pipenv](https://pipenv.pypa.io/) or virtualenv for environment isolation

- **Frontend:**
  - Node.js (v14 or later)
  - npm (or yarn)

### Backend Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/geomatic-assessment.git
   cd geomatic-assessment
   ```

2. **Create and Activate a Virtual Environment:**

   ```bash
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   ```

3. **Install Python Dependencies:**

   If a `requirements.txt` is available:

   ```bash
   pip install -r requirements.txt
   ```

   Otherwise, manually install dependencies:

   ```bash
   pip install fastapi uvicorn pandas numpy python-multipart
   ```

4. **Data Files:**

   Ensure the `data` folder contains the following files:
   - `provinces.geojson`
   - `regions.geojson`
   - `transport_stations.csv`

5. **Run the Backend Server:**

   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at [http://localhost:8000](http://localhost:8000).

### Frontend Setup

1. **Navigate to the Frontend Directory:**

   The `package.json` file is located in the root of the repository if the project is not split into multiple folders.

2. **Install npm Dependencies:**

   ```bash
   npm install
   ```

3. **Start the React Development Server:**

   ```bash
   npm start
   ```

   The app will be accessible at [http://localhost:3000](http://localhost:3000).

## Usage

1. **Launch the Application:**
   - Ensure the backend server is running on port 8000.
   - Start the frontend React app on port 3000.
   - Open your browser and go to [http://localhost:3000](http://localhost:3000).

2. **Interacting with the Map:**
   - Use the **Sidebar** to select filters by region or province.
   - Set a proximity radius and choose a transport station type to perform spatial queries.
   - Draw custom query areas on the map using the built-in Sketch tool.
   - View dynamic charts showing the distribution of transport station types.

3. **API Endpoints:**
   - **`GET /`**: Welcome message.
   - - **`GET /docs`**: the Swagger UI of the API.
   - **`GET /provinces`**: Returns provinces GeoJSON.
   - **`GET /regions`**: Returns regions GeoJSON.
   - **`GET /transport-stations`**: Returns transport stations data (optionally filtered by transport type using query parameters).

## Approach and Assumptions

- **Approach:**
  - **Backend:** The backend is built with FastAPI to quickly serve geospatial data from static files and CSVs. Data cleaning is performed using Pandas and NumPy before serving JSON responses.
  - **Frontend:** The React application uses the ArcGIS API to integrate a full-featured map with various layers and interactive tools. The Sidebar component allows users to interactively filter and query data, which updates both the map view and associated charts.
  - **Integration:** Communication between the frontend and backend is facilitated through RESTful API endpoints, ensuring that transport stations is dynamically loaded into the map.
  
- **Assumptions:**
  - Data files (GeoJSON and CSV) are formatted and placed in the expected directories.
  - The backend server runs on `http://localhost:8000` and the frontend on `http://localhost:3000`.
  - Users have a modern browser that supports the necessary JavaScript APIs for rendering the map and handling dynamic queries.
  - No advanced user authentication or security mechanisms are implemented, as the focus is on demonstrating geospatial data visualization and querying.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (e.g., `git checkout -b feature/YourFeature`).
3. Commit your changes (e.g., `git commit -m 'Add new feature'`).
4. Push to your branch (e.g., `git push origin feature/YourFeature`).
5. Open a pull request detailing your changes.

Ensure your code adheres to the established code quality and style guidelines.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact
elfekhar.inssaf@gmail.com