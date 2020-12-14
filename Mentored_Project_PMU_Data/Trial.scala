package com.sundogsoftware.spark


import breeze.linalg.Matrix.castOps
import breeze.linalg.Vector.castOps
import breeze.linalg._
import breeze.numerics._
import org.apache.spark._
import org.apache.log4j._
import breeze.linalg.{DenseMatrix}
import org.apache.spark.rdd._

import scala.collection.mutable.ArrayBuffer
import org.apache.spark.mllib.linalg.Matrix

object Trial {

  def ConvertMatrix(values : RDD[ArrayBuffer[String]]) : (DenseMatrix[Double],Array[String]) ={

    val len=values.count().toInt
    val arr1= values.collect().flatten
    val col_num=((arr1.length/len)).toInt

    val arr1_int= arr1.slice(col_num,arr1.length).map(_.toDouble)
    val names = arr1.slice(0,col_num)
    val dense = new DenseMatrix(col_num,len-1,arr1_int)

    (dense,names)
  }

  def ExtractValues(lines: RDD[String], arr : Array[Int]): RDD[ArrayBuffer[String]] ={
    val result= lines.map(x=>   x.split(",")).map(x=>{
      val xbuffer = new ArrayBuffer[String]()
      for (i <- arr){
        if(i!=0) {
          xbuffer.append(x(i))
        }
      }
      xbuffer

    })

    result
  }

  def main(args: Array[String]) {

    // Set the log level to only print errors
    Logger.getLogger("org").setLevel(Level.ERROR)

    // Create a SparkContext using every core of the local machine
    val sc = new SparkContext("local[*]", "Trial")

    // Load each line of the source data into an RDD
    val lines = sc.textFile("data/West.csv")


    val columns=lines.first().split(",")

    var pu_array=Array(0)
    var angle_array=Array(0)
    var freq_array=Array(0)
    var counter=0
    for(col <- columns){
      var temp=(col.split(" "))
      if(temp.length>1){
        if(temp.indexOf("pu")==temp.length-1){

          pu_array=pu_array :+ counter
        }
        if(temp.indexOf("angle")==temp.length-1){

          angle_array=angle_array :+ counter
        }
        if(temp.indexOf("Frequency")==temp.length-1){

          freq_array=freq_array :+ counter
        }
      }
      counter= counter+1
    }

    val pu_values=ExtractValues(lines,pu_array)

    val angle_values=ExtractValues(lines,angle_array)

    val freq_values=ExtractValues(lines,freq_array)



    val (freq_dense,freq_names) = ConvertMatrix(freq_values)

    val (pu_dense,pu_names) = ConvertMatrix(pu_values)

    val (angle_dense,angle_names) = ConvertMatrix(angle_values)


    val Va = (pu_dense *:* cos(angle_dense)).t
    val Vb =(pu_dense *:* (cos(angle_dense + DenseMatrix.tabulate(angle_dense.rows, angle_dense.cols){case (i, j) => 120.00}))).t
    val Vc =(pu_dense *:* (cos(angle_dense + DenseMatrix.tabulate(angle_dense.rows, angle_dense.cols){case (i, j) => 240.00}))).t

  }

}
