import pandas
import collections
import csv

# df = pandas.read_csv("ACTIVSg2000 - Coast.csv",skipinitialspace=True, index_col=[2,3])
# print(df[1])

partitions = 10  ## change partitions
df = pandas.read_csv('ACTIVSg2000 - Coast.csv',  nrows=1)   ## change name
columns = list(df)
col_len = len(columns)
step = int(len(columns)/partitions)
strt = 1
num = 1
dic = collections.defaultdict(list)
while(1):
    # strt = num*step+1

    end = strt+step
    print(strt)

    while(end-strt+1)%3!=0:
        end+=1
        # print((end-strt+1)%3)
    print(end+1)
    end+=1
    end = min(col_len,end)
    cols = [columns[0]]+columns[strt:end]
    # print(cols)
    df = pandas.read_csv("ACTIVSg2000 - Coast.csv", usecols=cols)    ## change name
    filename = "coast{}.csv".format(num)
    file = filename.split(".")[0]
    dic[file]=cols[1:]
    df.to_csv(filename)
    df= None
    # my_dict = {'1': 'aaa', '2': 'bbb', '3': 'ccc'}
    with open('mapping.csv', 'w') as f:
        for key in dic.keys():
            f.write("%s,%s\n"%(key,dic[key]))
    strt = end
    print("Next_Start: ",strt,columns[strt])
    if strt>=col_len:
        break
    num+=1
    # print(dic)

# print(df)


# import csv
# from collections import defaultdict
#
# columns = defaultdict(list)
# with open('ACTIVSg2000 - Coast.csv', 'r') as f:
#     reader = csv.reader(f, delimiter=',')
#     for row in reader:
#         for i in range(len(row)):
#             columns[i].append(row[i])
# # Following line is only necessary if you want a key error for invalid column numbers
# columns = dict(columns)


# with open("ACTIVSg2000 - Coast.csv",'r') as f:
#     with open("updated_test.csv",'w') as f1:
#         next(f) # skip header line
#         for line in f:
#             f1.write(line)
