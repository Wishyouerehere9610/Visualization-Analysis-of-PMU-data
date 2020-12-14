import java.io.*;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Scanner;
import java.util.Set;

  /*** ** How to compile & run from commandline ** ***\
 *              				                       *
* compile:        javac ColNameScript.java              *
* run:            java ColNameScript                    *
 *                                                     *
  \*** ******************************************* ***/


/**
*
* @author: vktiwary
*/

public class ColNameScript {

    public static void main(String[] args) throws IOException {
	// write your code here
	
	//change the input file containing column names as string here
        File file = new File("/Users/vivektiwary/Downloads/pmu_data/coastcol.txt");
        Scanner sc = new Scanner(file);
        String op = "";
        while (sc.hasNextLine())
            op = sc.nextLine();

        String[] bus1 = op.split("Bus");
        Set<String> set = new HashSet<String>();
        Set<String> duplicates = new HashSet<>();
        for(int i = 0; i < bus1.length; i++) {

            bus1[i] = bus1[i].trim().replaceAll("\\s+","_");
            bus1[i] += " numeric";
            if(set.contains(bus1[i]) && !duplicates.contains(bus1[i])) {
                duplicates.add(bus1[i]);
            }
            set.add(bus1[i]);
        }
	System.out.println("Columns Array :::");
        System.out.println(Arrays.toString(bus1));
	System.out.println("Duplicate Columns :::");
        System.out.println(duplicates);
	System.out.println("Expected Number of Unique Columns that should be generated :::");
        System.out.println(set.size());
	System.out.println("Actual number of Columns generated");
        System.out.println(bus1.length);
	//change the output file here
        BufferedWriter br = new BufferedWriter(new FileWriter("/Users/vivektiwary/Downloads/pmu_data/coastcolnames.txt"));
        StringBuilder sb = new StringBuilder();

// Append strings from array
        for (String element : bus1) {
            sb.append(element);
            sb.append(",");
        }

        br.write(sb.toString());
        br.close();

    }

}


