import geopandas as gpd
import pandas as pd
import os
import glob

# Đường dẫn đến thư mục chứa các tệp shapefile
shp_folder = "C:/Users/ASUS/Downloads/vietnam-latest-free.shp/"

# Kiểm tra thư mục tồn tại
if not os.path.exists(shp_folder):
    print(f"Không tìm thấy thư mục {shp_folder}. Vui lòng kiểm tra đường dẫn.")
    exit()

# Tìm tất cả các tệp .shp trong thư mục
shp_files = glob.glob(os.path.join(shp_folder, "*.shp"))

if not shp_files:
    print(f"Không tìm thấy tệp .shp nào trong thư mục {shp_folder}")
    exit()

print(f"Đã tìm thấy {len(shp_files)} tệp shapefile.")

# Khởi tạo DataFrame rỗng để lưu trữ tất cả dữ liệu
all_data = pd.DataFrame()

# Đọc từng tệp shapefile và gộp vào DataFrame chung
for shp_file in shp_files:
    print(f"Đang đọc tệp: {os.path.basename(shp_file)}...")
    try:
        # Đọc shapefile
        gdf = gpd.read_file(shp_file)
        
        # Lưu tổng số bản ghi ban đầu
        total_records = len(gdf)
        
        # Kiểm tra xem có cột 'name' không
        if 'name' not in gdf.columns:
            print(f"  Tệp {os.path.basename(shp_file)} không có cột 'name'. Bỏ qua.")
            continue
            
        # Bước 1: Loại bỏ None và NaN
        gdf = gdf.dropna(subset=['name'])
        
        # Bước 2: Loại bỏ các chuỗi không hợp lệ
        invalid_values = ['', 'none', 'null', 'nan', 'undefined']
        mask = ~gdf['name'].astype(str).str.lower().str.strip().isin(invalid_values)
        gdf = gdf[mask]
        
        # Bước 3: Loại bỏ chuỗi chỉ chứa khoảng trắng
        gdf = gdf[gdf['name'].astype(str).str.strip() != '']
        
        # In thông báo về số bản ghi đã loại bỏ
        removed_records = total_records - len(gdf)
        print(f"  Đã loại bỏ {removed_records} bản ghi có name không hợp lệ")
        
        # Chuyển đổi cột geometry thành dạng WKT (Well-Known Text)
        gdf['geometry'] = gdf['geometry'].apply(lambda x: x.wkt if x is not None else None)
        
        # Thêm cột chỉ ra nguồn tệp
        gdf['source_file'] = os.path.basename(shp_file) 
        all_data = pd.concat([all_data, gdf], ignore_index=True) 
    
    except Exception as e:
        print(f"  Lỗi khi đọc tệp {os.path.basename(shp_file)}: {e}")

# Kiểm tra trùng lặp osm_id và xử lý
if 'osm_id' in all_data.columns:
    duplicate_count = all_data.duplicated('osm_id', keep=False).sum()
    print(f"\nSố bản ghi có osm_id trùng lặp: {duplicate_count}")
    
    if duplicate_count > 0:
        # Tạo ID duy nhất để tránh mất dữ liệu
        all_data['unique_id'] = all_data['osm_id'].astype(str) + '_' + all_data.groupby('osm_id').cumcount().astype(str)
        print("Đã tạo cột unique_id để phân biệt các bản ghi trùng lặp")

# Kiểm tra kết quả
if len(all_data) == 0:
    print("Không có dữ liệu nào được đọc hoặc không tìm thấy địa điểm du lịch.")
    exit()

# Đường dẫn đến tệp CSV đầu ra
output_csv = "tourism_pois_all.csv"

# Lưu dữ liệu vào tệp CSV
print(f"Đang lưu {len(all_data)} bản ghi vào tệp CSV...")
all_data.to_csv(output_csv, index=False, encoding='utf-8')
print(f"Đã lưu dữ liệu thành công vào tệp: {output_csv}")

# In thông tin thống kê
print("\nThống kê:")
if 'fclass' in all_data.columns:
    print(all_data['fclass'].value_counts())

# In phân bố theo nguồn
print("\nPhân bố theo tệp nguồn:")
print(all_data['source_file'].value_counts())

print("\nMột số bản ghi mẫu:")
print(all_data.head())