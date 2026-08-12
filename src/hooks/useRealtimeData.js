import { useEffect, useState } from 'react'
import { subscribeFilteredList, subscribeList, subscribeRecord } from '../services/bankRepository'

export function useRealtimeList(path, filterChild, filterValue) {
  const [data,setData]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(null)
  useEffect(()=>{setLoading(true);setError(null);const success=value=>{setData(value);setError(null);setLoading(false)};const failure=reason=>{setData([]);setError(reason);setLoading(false)};return filterChild?subscribeFilteredList(path,filterChild,filterValue,success,failure):subscribeList(path,success,failure)},[path,filterChild,filterValue])
  return {data,loading,error}
}
export function useRealtimeRecord(path) {
  const [data,setData]=useState(null); const [loading,setLoading]=useState(true); const [error,setError]=useState(null)
  useEffect(()=>{if(!path){setData(null);setError(null);setLoading(false);return}setLoading(true);setError(null);return subscribeRecord(path,value=>{setData(value);setError(null);setLoading(false)},reason=>{setData(null);setError(reason);setLoading(false)})},[path])
  return {data,loading,error}
}
