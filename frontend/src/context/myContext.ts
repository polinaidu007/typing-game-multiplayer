import { createContext } from 'react';
import { MyContextType } from '../interfaces/all.interface';

console.log('myContext.ts')
const MyContext = createContext<MyContextType>({} as any);
export default MyContext