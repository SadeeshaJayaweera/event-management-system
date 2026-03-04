import os
import glob

services = [
    'profile-service', 'analytics-service', 'auth-service', 
    'event-service', 'notification-service', 'review-service', 'ticket-service'
]

postgres_dep = """
<dependency>
<groupId>org.postgresql</groupId>
<artifactId>postgresql</artifactId>
<scope>runtime</scope>
</dependency>
"""

for service in services:
    pom_path = os.path.join(service, 'pom.xml')
    if os.path.exists(pom_path):
        with open(pom_path, 'r') as f:
            content = f.read()
        
        # Add postgresql dependency right after H2
        if '<artifactId>h2</artifactId>' in content and '<artifactId>postgresql</artifactId>' not in content:
            # find the end of the h2 dependency block
            h2_end_idx = content.find('</dependency>', content.find('<artifactId>h2</artifactId>')) + 13
            new_content = content[:h2_end_idx] + postgres_dep + content[h2_end_idx:]
            
            with open(pom_path, 'w') as f:
                f.write(new_content)
            print(f"Updated {pom_path}")
