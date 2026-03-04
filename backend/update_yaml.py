import os
import re

services = [
    'profile-service', 'analytics-service', 'auth-service', 
    'event-service', 'notification-service', 'review-service', 'ticket-service'
]

for service in services:
    yaml_path = os.path.join(service, 'src', 'main', 'resources', 'application.yml')
    if os.path.exists(yaml_path):
        with open(yaml_path, 'r') as f:
            content = f.read()

        # Extract db name
        match = re.search(r'jdbc:h2:mem:([a-zA-Z0-9]+)|jdbc:h2:file:/data/([a-zA-Z0-9]+)', content)
        db_name = "testdb"
        if match:
            db_name = match.group(1) if match.group(1) else match.group(2)
        
        # Define replacements
        url_pattern = r'url:\s*(jdbc:h2:[^\n]+)'
        class_pattern = r'driverClassName:\s*(org\.h2\.Driver)'
        user_pattern = r'username:\s*(sa)'
        pass_pattern = r'password:(.*)'
        
        def url_repl(m):
            return f"url: ${{SPRING_DATASOURCE_URL:{m.group(1)}}}"
        
        def class_repl(m):
            return f"driverClassName: ${{SPRING_DATASOURCE_DRIVER_CLASS_NAME:{m.group(1)}}}"
        
        def user_repl(m):
            return f"username: ${{SPRING_DATASOURCE_USERNAME:{m.group(1)}}}"
            
        def pass_repl(m):
            orig_pass = m.group(1).strip()
            return f"password: ${{SPRING_DATASOURCE_PASSWORD:{orig_pass}}}"
            
        new_content = re.sub(url_pattern, url_repl, content)
        new_content = re.sub(class_pattern, class_repl, new_content)
        new_content = re.sub(user_pattern, user_repl, new_content)
        new_content = re.sub(pass_pattern, pass_repl, new_content)
        
        # Add hibernate dialect setting if not present
        if 'database-platform' not in new_content and 'dialect' not in new_content:
            jpa_section = r'jpa:\n    hibernate:\n      ddl-auto: (update|create|create-drop|validate)'
            def jpa_repl(m):
                return f"jpa:\n    database-platform: ${{SPRING_JPA_DATABASE_PLATFORM:org.hibernate.dialect.H2Dialect}}\n    hibernate:\n      ddl-auto: {m.group(1)}"
            new_content = re.sub(jpa_section, jpa_repl, new_content)

        with open(yaml_path, 'w') as f:
            f.write(new_content)
        print(f"Updated {yaml_path}")
