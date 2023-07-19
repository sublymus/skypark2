using System;

namespace MyApplication
{
  class Program
  {
    static void Main(string[] args)
    {
        int[] arr = new int[]{-5 ,-4 ,-3 ,-2 ,-1 ,0 ,1 ,2, 3, 4, 5};

      string pos = "";
      string div = "";
      string odd = "";
       for(int i = 0;i<arr.Length;i++){
           if(arr[i]>0){
               pos+=(arr[i])+" ";
           }
           if(arr[i]%5==0){
               div+=(arr[i])+" ";
           }
           if(Math.Abs(arr[i]%2)==1){
               odd+=(arr[i])+" ";
           }
       }
       Console.WriteLine("1) "+pos);
       Console.WriteLine("2) "+div);
       Console.WriteLine("3) "+odd);
    }

  }
}
