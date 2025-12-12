import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { excludePasswordExtension } from './prisma.extension';

function createExtendedClient(rawClient: PrismaClient) {
  return rawClient.$extends(excludePasswordExtension);
}

type ExtendedPrismaClient = ReturnType<typeof createExtendedClient>;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: ExtendedPrismaClient; // aman (password hidden)
  private readonly rawClient: PrismaClient; // pintu darurat (login)

  constructor() {
    this.rawClient = new PrismaClient();
    this.client = createExtendedClient(this.rawClient);

    const modelKeys = Object.keys(this.client).filter(
      (key) => !key.startsWith('$') && !key.startsWith('_'),
    ) as (keyof typeof this.client)[];

    for (const key of modelKeys) {
      Object.defineProperty(this, key, {
        configurable: false,
        enumerable: true,
        get: () => this.client[key],
      });
    }

    const dollarKeys = Object.keys(this.client).filter((k) =>
      k.startsWith('$'),
    ) as (keyof typeof this.client)[];
    for (const key of dollarKeys) {
      Object.defineProperty(this, key, {
        configurable: false,
        enumerable: false,
        get: () => {
          const value = (this.client as any)[key];
          return typeof value === 'function' ? value.bind(this.client) : value;
        },
      });
    }

    const proto = Object.getPrototypeOf(this.client);
    const protoKeys = Object.getOwnPropertyNames(
      proto,
    ) as (keyof typeof proto)[];
    for (const key of protoKeys) {
      if (typeof key === 'string' && key.startsWith('$')) {
        Object.defineProperty(this, key, {
          configurable: false,
          enumerable: false,
          get: () => (this.client as any)[key].bind(this.client),
        });
      }
    }
  }

  async onModuleInit() {
    await this.rawClient.$connect();
  }

  async onModuleDestroy() {
    await this.rawClient.$disconnect();
  }

  public get raw() {
    return this.rawClient;
  }
}

export interface PrismaService extends ExtendedPrismaClient {}
