# Project: Online Age of Empires (Working Title)

## 1. Core Concept

This project is a web-based, real-time strategy (RTS) game inspired by classics like *Age of Empires II* and persistent browser-based games like *Travian*. The core vision is to create a **slow-paced, persistent world** where players build an empire over weeks and months, not hours.

The gameplay will be **asynchronous**, allowing players to log in a few times a day to manage their empire, issue commands, and interact with the world. The focus is on long-term strategic planning, resource management, and economic development rather than high-actions-per-minute (APM) micromanagement.

## 2. Game Cadence & Pacing

The defining feature of this game is its **extremely slow pace**. Actions will take significant real-world time to complete.

*   **Resource Gathering:** Resources will trickle in slowly, making every decision impactful.
*   **Construction:** Buildings will take hours or even days to complete in later stages.
*   **Unit Training:** Training military units will be a time-consuming process.
*   **Travel:** Moving units across the map will take a considerable amount of time.

This design encourages players to think ahead and plan their actions carefully. It also makes the game accessible to players with busy schedules.

## 3. Core Gameplay Mechanics

### 3.1. Resources

The game will start with four fundamental resources:

*   **Food:** Primarily for training villagers and military units.
*   **Wood:** Essential for buildings and some units.
*   **Gold:** Used for advanced units, technologies, and trade.
*   **Stone:** Crucial for defensive structures.

### 3.2. The "Ages" System & Visual Progression

Player progression is structured through a system of "Ages." Advancing to a new Age unlocks new buildings, units, and technologies. The visual style of the player's city will evolve with each Age.

*   **Age 1: Dawn Age (Start)**
    *   Players begin with a single Town Center and a few Villagers.
    *   **Focus:** Basic survival, resource gathering, and initial construction.
    *   **Visual Style:** Rustic, simple, wood and thatch structures.

*   **Age 2: Hearth Age**
    *   **Focus:** Establishing a stable economy, building a small military, and basic defenses.
    *   **Visual Style:** More organized and developed look, with early stone and timber framing.

*   **Age 3: Age of Expansion**
    *   **Focus:** Significant military expansion, advanced technologies, and establishing trade.
    *   **Visual Style:** Advanced structures, more complex architecture, and a clear sense of order.

*   **Age 4: The Gilded Age**
    *   **Focus:** End-game technologies, powerful siege units, and potentially world-changing Wonders.
    *   **Visual Style:** Ornate and impressive architecture, reflecting a powerful and wealthy empire.

### 3.3. Map & Building Placement

A core feature will be a **2D grid-based map** of the player's city. Players will be able to place and arrange their buildings on this grid, allowing for strategic city layout and customization.

### 3.4. Buildings (Initial Set)

| Building | Age | Function |
| :--- | :--- | :--- |
| **Town Center** | Dawn | Produces Villagers, acts as a resource drop-off point. |
| **House** | Dawn | Increases population capacity. |
| **Lumber Camp** | Dawn | Improves wood gathering efficiency. |
| **Mining Camp** | Dawn | Improves gold and stone gathering efficiency. |
| **Mill** | Dawn | Improves food gathering efficiency. |
| **Storage Pit** | Dawn | Increases the maximum amount of resources you can hold. |
| **Barracks** | Hearth | Trains basic infantry units. |
| **Archery Range** | Hearth | Trains basic ranged units. |
| **Stable** | Hearth | Trains basic cavalry units. |
| **Blacksmith** | Hearth | Researches military unit upgrades. |
| **Walls** | Hearth | Provides basic defense for your town. |

### 3.5. Units (Initial Set)

| Unit | Building | Function |
| :--- | :--- | :--- |
| **Villager** | Town Center | Gathers resources and constructs buildings. |
| **Clubman** | Barracks | Basic, cheap infantry unit. |
| **Slinger** | Archery Range | Basic ranged unit. Weak in melee. |
| **Scout** | Stable | Fast-moving unit for exploration. Weak in combat. |

## 4. Civilizations

To maintain simplicity for the initial development, there will be **one standard civilization** with no unique bonuses.

**Future Development:** The plan is to introduce multiple civilizations, each with unique bonuses, units, and technologies, similar to *Age of Empires II*.

## 5. Web Development & Technology Principles

*   **Project Structure:** We will use a **monorepo** structure (e.g., using `npm` or `yarn` workspaces), with `client` and `server` folders in a single repository. This simplifies dependency management and code sharing.
*   **Modern Frontend:** The user interface will be a modern, visually appealing single-page application (SPA).
*   **UI/UX:** The user experience will be a high priority. The interface should be intuitive, responsive, and accessible.
*   **Code Quality:** The codebase will be well-structured, modular, and maintainable, using tools like linters and formatters.
*   **Performance:** The application will be optimized for fast load times and responsiveness.
*   **Technology Stack:** We will use **React** for the frontend and **Node.js** for the backend.

## 6. Future Development & Long-Term Vision

*   **Technology Tree:** A comprehensive tree with economic and military upgrades.
*   **Alliances & Diplomacy:** Players can form alliances for mutual defense, trade, and coordinated attacks.
*   **Trade & Markets:** A system for players to trade resources with each other.
*   **Advanced Military:** A "rock-paper-scissors" counter system for units.
*   **Wonders:** Grand, expensive buildings that could provide significant bonuses or even a win condition.
*   **Map & Exploration:** A large, persistent world map to explore.
