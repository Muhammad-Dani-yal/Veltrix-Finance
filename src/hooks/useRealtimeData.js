import { useEffect, useState } from 'react'
import { subscribeFilteredList, subscribeList, subscribeRecord } from '../services/bankRepository'

export function useRealtimeList(path, filterChild, filterValue) {
  const [data,setData]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(null)
  useEffect(()=>{setLoading(true);const success=value=>{setData(value);setLoading(false)};const failure=reason=>{setError(reason);setLoading(false)};return filterChild?subscribeFilteredList(path,filterChild,filterValue,success,failure):subscribeList(path,success,failure)},[path,filterChild,filterValue])
  return {data,loading,error}
}
export function useRealtimeRecord(path) {
  const [data,setData]=useState(null); const [loading,setLoading]=useState(true); const [error,setError]=useState(null)
  useEffect(()=>{if(!path){setData(null);setLoading(false);return}setLoading(true);return subscribeRecord(path,value=>{setData(value);setLoading(false)},reason=>{setError(reason);setLoading(false)})},[path])
  return {data,loading,error}
}
