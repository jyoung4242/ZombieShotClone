# Zombie Shooter Clone

Zombie Shot Clone is a top-down 2D shooter game built with TypeScript and Vite. Players must survive waves of zombies, collect pickups,
and manage their health and ammo to achieve the highest score possible.

## Features

- Fast-paced zombie shooting action
- Multiple zombie types (chaser, bloater, crawler)
- Health and ammo pickups
- Player health bar and UI
- Sound effects and background music
- Tile-based map and custom shaders
- Modular code structure for easy expansion

## Gameplay

- Use your mouse to aim and shoot zombies
- Move with WASD keys
- Collect health and ammo pickups to survive longer
- Avoid getting surrounded by zombies
- The game ends when your health reaches zero

## Project Structure

```
ZombieShotClone/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.js
├── public/
├── src/
│   ├── main.ts
│   ├── resources.ts
│   ├── style.css
│   ├── Actors/
│   ├── Assets/
│   ├── Components/
│   ├── Lib/
│   ├── Scene/
│   ├── Shaders/
│   ├── TileMap.ts/
│   └── UI/
└── test/
```

## Getting Started

1. **Install dependencies:**
   ```powershell
   npm install
   ```
2. **Run the game locally:**
   ```powershell
   npm run dev
   ```
3. Open your browser to the local server URL (usually `http://localhost:5173`).

## Technologies Used

- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Excalibur.js](https://excaliburjs.com/) (game engine)

## Contributing

Pull requests are welcome! Feel free to open issues for bugs or feature requests.

## License

This project is licensed under the MIT License.
