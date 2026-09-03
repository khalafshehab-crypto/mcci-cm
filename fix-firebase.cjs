const fs = require('fs');

let c = fs.readFileSync('src/lib/firebase.ts', 'utf8');

c = c.replace(/import \* as mockFb from "\.\/mockFirebase";/g, '');

c = c.replace(/export function collection\([\s\S]*?\} catch \(e\) \{[\s\S]*?\}/, `export function collection(dbRef: any, collectionName: string): any {
  return fbCollection(dbRef, collectionName);
`);

c = c.replace(/export function doc\([\s\S]*?\} catch \(e\) \{[\s\S]*?\}/, `export function doc(dbRef: any, nameOrPath: string, maybeId?: string): any {
  return maybeId ? fbDoc(dbRef, nameOrPath, maybeId) : fbDoc(dbRef, nameOrPath);
`);

c = c.replace(/export function query\([\s\S]*?\} catch \(e\) \{[\s\S]*?\}/, `export function query(collectionRef: any, ...queryConstraints: any[]): any {
  return fbQuery(collectionRef, ...queryConstraints);
`);

c = c.replace(/export async function addDoc\([\s\S]*?\} catch \(e\) \{[\s\S]*?\}/, `export async function addDoc(collectionRef: any, data: any): Promise<any> {
  return fbAddDoc(collectionRef, data);
`);

c = c.replace(/export async function setDoc\([\s\S]*?\} catch \(e\) \{[\s\S]*?\}/, `export async function setDoc(docRef: any, data: any, options?: any): Promise<any> {
  return options !== undefined ? fbSetDoc(docRef, data, options) : fbSetDoc(docRef, data);
`);

c = c.replace(/export async function updateDoc\([\s\S]*?\} catch \(e\) \{[\s\S]*?\}/, `export async function updateDoc(docRef: any, data: any): Promise<any> {
  return fbUpdateDoc(docRef, data);
`);

c = c.replace(/export async function deleteDoc\([\s\S]*?\} catch \(e\) \{[\s\S]*?\}/, `export async function deleteDoc(docRef: any): Promise<any> {
  return fbDeleteDoc(docRef);
`);

c = c.replace(/export function onSnapshot\([\s\S]*?\} catch \(e\) \{[\s\S]*?\}/, `export function onSnapshot(queryOrColRef: any, onNext: (snap: any) => void, onError?: (err: any) => void): any {
  const safeOnError = onError || ((err: any) => {
    console.warn("Firestore snapshot listener error:", err);
  });
  return fbOnSnapshot(queryOrColRef, onNext, safeOnError);
`);

c = c.replace(/export async function getDoc\([\s\S]*?\} catch \(e\) \{[\s\S]*?\}/, `export async function getDoc(docRef: any): Promise<any> {
  return fbGetDoc(docRef);
`);

c = c.replace(/export async function getCountFromServer\([\s\S]*?\} catch \(e\) \{[\s\S]*?\}/, `export async function getCountFromServer(queryOrColRef: any): Promise<any> {
  return fbGetCountFromServer(queryOrColRef);
`);

c = c.replace(/export async function getDocs\([\s\S]*?\} catch \(e\) \{[\s\S]*?\}/, `export async function getDocs(queryOrColRef: any): Promise<any> {
  return fbGetDocs(queryOrColRef);
`);

fs.writeFileSync('src/lib/firebase.ts', c);
