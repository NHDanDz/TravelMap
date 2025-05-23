import pandas as pd

def classify_type(row):
    """
    Classify building type based on its name
    """
    name_lower = str(row['name']).lower()
    
    # Market/Chợ classification
    if 'chợ' in name_lower:
        return 'market'
    
    # Coffee shop classification
    if 'cafe' in name_lower or 'cà phê' in name_lower or 'coffee' in name_lower:
        return 'coffee'
    if 'lăng' in name_lower: 
        return 'mausoleum'
    
    # Church classification
    if 'nhà thờ' in name_lower or 'church' in name_lower:
        return 'church'
    
    # School classification
    if 'trường' in name_lower or 'school' in name_lower:
        return 'school'
    if 'cao đẳng' in name_lower:
        return 'college'
    
    # Hospital classification
    if 'bệnh viện' in name_lower or 'hospital' in name_lower:
        return 'hospital'
    
    # Apartment classification
    if 'chung cư' in name_lower or 'apartments' in name_lower:
        return 'apartments'
    
    # University classification
    if 'đại học' in name_lower or 'university' in name_lower:
        return 'university'
    
    if 'bank' in name_lower or 'ngân hàng' in name_lower:
        return 'bank'
    
    # Museum classification
    if 'bảo tàng' in name_lower or 'museum' in name_lower:
        return 'museum'
    
    if 'công ty' in name_lower: 
        return 'company'
    
    # Office classification
    if 'văn phòng' in name_lower or 'office' in name_lower:
        return 'office'
    
    if 'nhà khách' in name_lower: 
        return 'guesthouse'
    
    # If no specific type found, use existing type or fclass
    return (row['type'] if pd.notna(row['type']) and row['type'] != '' 
            else row['fclass'].lower() if pd.notna(row['fclass']) 
            else '')

# Read the input CSV
df = pd.read_csv('tourism_pois_all.csv')

# Apply type classification
df['type'] = df.apply(classify_type, axis=1)

# Save the updated CSV
df.to_csv('tourism_pois_all_1.csv', index=False)

# Display some statistics
print("Total number of POIs:", len(df))
print("\nPOI type distribution:")
type_counts = df['type'].value_counts()
print(type_counts)

# Calculate percentage distribution
type_percentages = (type_counts / len(df) * 100).round(2)
print("\nPOI type percentage distribution:")
print(type_percentages)

# Display some sample rows with new types
print("\nSample rows with updated types:")
print(df[['name', 'type']].head(15))

# Optional: Check for any remaining empty types
empty_types = df[df['type'] == '']
print("\nNumber of POIs with empty type:", len(empty_types))
if len(empty_types) > 0:
    print("\nSample POIs with empty type:")
    print(empty_types[['name', 'fclass']].head())