declare module 'chart.js' {
  export class Chart {
    static register(...items: any[]): void;
  }
  export const CategoryScale: any;
  export const LinearScale: any;
  export const PointElement: any;
  export const LineElement: any;
  export const Title: any;
  export const Tooltip: any;
  export const Legend: any;
}

declare module 'react-chartjs-2' {
  import { FC } from 'react';
  export const Line: FC<any>;
}