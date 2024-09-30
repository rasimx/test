import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
import * as fs from 'fs';
import * as readline from 'readline';

class Location {
  public addPlaces: Set<string>;
  public children: Map<string, Location>;

  constructor() {
    this.addPlaces = new Set();
    this.children = new Map();
  }
}

class MyCustomClass {
  private root: Location;
  private cache: Map<string, string[]>;

  constructor(filePath: string) {
    this.root = new Location();
    this.cache = new Map();
    this.parseFile(filePath);
  }


  private parseFile(filePath: string): void {
    // реализуем чтение файла через стрим дабы ограничить потребление памяти
    const fileStream = fs.createReadStream(filePath, {
      encoding: 'utf-8',
    });

    const rl = readline.createInterface({
      input: fileStream,
    });

    rl.on('line', (line: string) => {
      if (!line.trim()) return;

      const [addPlace, locations] = line.trim().split(':');
      const list = locations.split(',');

      for (const item of list) {
        this.addLocation(item, addPlace);
      }
    });

    rl.on('close', () => {
      console.log('Конец чтения файла');
    });
  }

  private addLocation(location: string, platform: string): void {
    let currentLocation = this.root;
    const parts = location.split('/');

    for (const part of parts) {
      if (!currentLocation.children.has(part)) {
        currentLocation.children.set(part, new Location());
      }
      currentLocation = currentLocation.children.get(part)!;
    }

    currentLocation.addPlaces.add(platform);
  }

  private findLocation(location: string): Location | null {
    let currentNode = this.root;
    const parts = location.split('/');

    for (const part of parts) {
      if (!currentNode.children.has(part)) {
        return null;
      }
      currentNode = currentNode.children.get(part)!;
    }

    return currentNode;
  }

  public findAddPlace(location: string): string[] {
    if (this.cache.has(location)) {
      return this.cache.get(location)!;
    }

    const result = new Set<string>();

    const parts = location.split('/');
    for (let i = parts.length; i > 0; i--) {
      const prefix = parts.slice(0, i).join('/');
      let currentNode = this.findLocation(prefix);

      if (currentNode) {
        for (const addPlace of currentNode.addPlaces) {
          result.add(addPlace);
        }
      }
    }

    const addPlaceList = Array.from(result);
    this.cache.set(location, addPlaceList);
    return addPlaceList;
  }
}

const filePath = path.join(__dirname, 'basic.txt');
const finder = new MyCustomClass(filePath);


setTimeout(() => {
  console.log(finder.findAddPlace('/ru/msk'));
  console.log(finder.findAddPlace('/ru/svrd'));
  console.log(finder.findAddPlace('/ru/svrd/ekb'));
  console.log(finder.findAddPlace('/ru/svrd/revda'));
  console.log(finder.findAddPlace('/ru/svrd/pervik'));
  console.log(finder.findAddPlace('/ru'));
  console.log(finder.findAddPlace('/be/msk'));
}, 500);
