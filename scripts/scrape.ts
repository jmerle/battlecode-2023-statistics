import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import axios, { AxiosError } from 'axios';
import { deepEqual } from 'fast-equals';
import PQueue from 'p-queue';
import * as pako from 'pako';
import { DataFiles } from '../src/models';

function getDataFile(key: keyof DataFiles, extension: string): string {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const currentFile = url.fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), `../data/${key}.${extension}`);
}

async function getData<T extends keyof DataFiles>(key: T): Promise<DataFiles[T]> {
  const content = await fs.promises.readFile(getDataFile(key, 'zlib'));
  return JSON.parse(pako.inflate(content, { to: 'string' }));
}

async function setData<T extends keyof DataFiles>(key: T, data: DataFiles[T]): Promise<any> {
  await fs.promises.writeFile(getDataFile(key, 'zlib'), pako.deflate(JSON.stringify(data)));
  await fs.promises.writeFile(getDataFile(key, 'txt'), Date.now().toString());
}

async function request(url: string): Promise<any> {
  console.log(`GET ${url}`);

  while (true) {
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        responseType: 'json',
      });

      return response.data;
    } catch (err) {
      if ((err as AxiosError).code === 'ECONNABORTED') {
        continue;
      }

      throw err;
    }
  }
}

async function scrapeTeams(): Promise<void> {
  console.log('Scraping teams');
  const teams: DataFiles['teams'] = {};

  const firstResponse = await request(`https://api.battlecode.org/api/team/bc23/t/?format=json&ordering=pk&page=1`);
  const pageCount = Math.ceil(firstResponse.count / 10);

  const queue = new PQueue({ concurrency: 4 });

  for (let i = 1; i <= pageCount; i++) {
    queue.add(async () => {
      const response = await request(`https://api.battlecode.org/api/team/bc23/t/?format=json&ordering=pk&page=${i}`);
      for (const team of response.results as any[]) {
        teams[team.id.toString()] = team;
      }
    });
  }

  await queue.onIdle();
  await setData('teams', teams);
}

async function scrapeScrimmages(): Promise<void> {
  console.log('Scraping scrimmages');
  const scrimmages = await getData('scrimmages');

  const firstResponse = await request(`https://api.battlecode.org/api/compete/bc23/match/?format=json&page=1`);
  const pageCount = Math.ceil(firstResponse.count / 10);

  const queue = new PQueue({ concurrency: 4 });

  let lastChanged = 0;
  for (let i = 1; i <= pageCount; i++) {
    const promise = queue.add(async () => {
      const response = await request(`https://api.battlecode.org/api/compete/bc23/match/?format=json&page=${i}`);
      for (const scrimmage of response.results) {
        if (!deepEqual(scrimmages[scrimmage.id.toString()], scrimmage)) {
          lastChanged = i;
        }

        scrimmages[scrimmage.id.toString()] = scrimmage;
      }
    });

    if (i % (queue.concurrency * 5) === 0) {
      await promise;
      if (i - lastChanged > 10) {
        console.log('No new scrimmage data for >10 pages');
        break;
      }
    }
  }

  await queue.onIdle();
  await setData('scrimmages', scrimmages);
}

async function run(): Promise<void> {
  await scrapeTeams();
  await scrapeScrimmages();
}

(async () => {
  try {
    await run();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
