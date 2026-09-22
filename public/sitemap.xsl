<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:html="http://www.w3.org/TR/REC-html40"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>XML Sitemap | ToolsVerse</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <style type="text/css">
          :root {
            --primary: #4f46e5;
            --primary-light: #6366f1;
            --primary-bg: #eef2ff;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --border-color: #e2e8f0;
            --card-bg: #ffffff;
            --body-bg: #f8fafc;
            --badge-green: #10b981;
            --badge-green-bg: #ecfdf5;
            --badge-blue: #0284c7;
            --badge-blue-bg: #f0f9ff;
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: var(--body-bg);
            color: var(--text-main);
            line-height: 1.5;
            padding: 24px 16px;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .header {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 28px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
            margin-bottom: 24px;
          }

          .header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 12px;
          }

          .brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .brand-logo {
            width: 42px;
            height: 42px;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 800;
            font-size: 20px;
          }

          .brand-title {
            font-size: 24px;
            font-weight: 800;
            color: var(--text-main);
            letter-spacing: -0.02em;
          }

          .brand-title span {
            color: var(--primary);
          }

          .home-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: var(--primary-bg);
            color: var(--primary);
            text-decoration: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
          }

          .home-btn:hover {
            background: #e0e7ff;
          }

          .description {
            color: var(--text-muted);
            font-size: 15px;
            max-width: 800px;
            margin-bottom: 20px;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-top: 16px;
          }

          .stat-card {
            background: var(--body-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 16px;
          }

          .stat-label {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 24px;
            font-weight: 800;
            color: var(--primary);
          }

          .stat-sub {
            font-size: 12px;
            color: var(--text-muted);
            margin-top: 2px;
          }

          .table-container {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }

          .table-header-bar {
            padding: 16px 20px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
          }

          .search-box {
            position: relative;
            flex: 1;
            max-width: 400px;
          }

          .search-input {
            width: 100%;
            padding: 10px 14px 10px 36px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
          }

          .search-input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
          }

          .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            font-size: 14px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 14px;
          }

          thead {
            background: #f1f5f9;
            border-bottom: 1px solid var(--border-color);
          }

          th {
            padding: 14px 18px;
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
          }

          tbody tr {
            border-bottom: 1px solid var(--border-color);
            transition: background-color 0.15s;
          }

          tbody tr:hover {
            background-color: #f8fafc;
          }

          tbody tr:last-child {
            border-bottom: none;
          }

          td {
            padding: 14px 18px;
            vertical-align: middle;
          }

          .url-link {
            color: var(--primary);
            font-weight: 600;
            text-decoration: none;
            word-break: break-all;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          .url-link:hover {
            text-decoration: underline;
          }

          .badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
          }

          .badge-freq-daily {
            background: var(--badge-green-bg);
            color: var(--badge-green);
          }

          .badge-freq-weekly {
            background: var(--badge-blue-bg);
            color: var(--badge-blue);
          }

          .badge-freq-monthly {
            background: #f1f5f9;
            color: #475569;
          }

          .badge-lang {
            background: #fdf4ff;
            color: #a855f7;
            border: 1px solid #f0abfc;
            font-weight: 700;
          }

          .priority-pill {
            display: inline-block;
            padding: 2px 8px;
            background: #f1f5f9;
            border-radius: 6px;
            font-family: monospace;
            font-weight: 700;
            color: #334155;
          }

          .footer-note {
            text-align: center;
            margin-top: 24px;
            color: var(--text-muted);
            font-size: 13px;
          }

          @media (max-width: 768px) {
            .hide-mobile {
              display: none;
            }
            th, td {
              padding: 10px 12px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-top">
              <div class="brand">
                <div class="brand-logo">T</div>
                <div>
                  <h1 class="brand-title">ToolsVerse <span>Sitemap</span></h1>
                  <p style="font-size: 13px; color: #64748b;">Official XML Sitemap with Multi-Country &amp; Multi-Language hreflang support</p>
                </div>
              </div>
              <a href="https://toolsverseapp.com" class="home-btn">&#8592; Back to ToolsVerse</a>
            </div>

            <p class="description">
              Yeh XML Sitemap search engines (Google, Bing, Baidu, Yandex) ke liye banaya gaya hai. Isme <strong>25 international countries/languages</strong> (China, Italy, Germany, France, Japan, etc.) ke alternate hreflang links shamil hain taaki Google search mein har country ke users ko correct localized page dikhe.
            </p>

            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">Total Indexed Pages</div>
                <div class="stat-value"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></div>
                <div class="stat-sub">PDF tools &amp; main routes</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Target Countries &amp; Regions</div>
                <div class="stat-value">25</div>
                <div class="stat-sub">China, Italy, Spain, France, etc.</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Total Alternate Links</div>
                <div class="stat-value">2,800+</div>
                <div class="stat-sub">Full hreflang matrix</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Protocol Standard</div>
                <div class="stat-value" style="font-size: 18px; line-height: 28px; color: #0284c7;">sitemaps.org 0.9</div>
                <div class="stat-sub">100% Google Search compliant</div>
              </div>
            </div>
          </div>

          <div class="table-container">
            <div class="table-header-bar">
              <div style="font-weight: 700; color: #334155;">
                Sitemap URLs (<span id="visibleCount"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></span>)
              </div>
              <div class="search-box">
                <span class="search-icon">&#128269;</span>
                <input type="text" id="urlSearch" class="search-input" placeholder="Filter tools or pages (e.g. merge, pdf, convert)..." onkeyup="filterUrls()" />
              </div>
            </div>

            <table id="sitemapTable">
              <thead>
                <tr>
                  <th style="width: 50px;">#</th>
                  <th>Page URL</th>
                  <th style="width: 140px;">Global Reach</th>
                  <th style="width: 130px;" class="hide-mobile">Frequency</th>
                  <th style="width: 90px;" class="hide-mobile">Priority</th>
                  <th style="width: 170px;" class="hide-mobile">Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td style="color: #94a3b8; font-family: monospace; font-size: 12px;">
                      <xsl:value-of select="position()"/>
                    </td>
                    <td>
                      <xsl:variable name="itemURL">
                        <xsl:value-of select="sitemap:loc"/>
                      </xsl:variable>
                      <a href="{$itemURL}" class="url-link" target="_blank">
                        <xsl:value-of select="sitemap:loc"/>
                      </a>
                    </td>
                    <td>
                      <span class="badge badge-lang" title="Alternate hreflang versions mapped for 25 countries">
                        &#127758; 25 Countries
                      </span>
                    </td>
                    <td class="hide-mobile">
                      <xsl:variable name="freq">
                        <xsl:value-of select="sitemap:changefreq"/>
                      </xsl:variable>
                      <xsl:choose>
                        <xsl:when test="$freq = 'daily'">
                          <span class="badge badge-freq-daily">daily</span>
                        </xsl:when>
                        <xsl:when test="$freq = 'weekly'">
                          <span class="badge badge-freq-weekly">weekly</span>
                        </xsl:when>
                        <xsl:otherwise>
                          <span class="badge badge-freq-monthly"><xsl:value-of select="$freq"/></span>
                        </xsl:otherwise>
                      </xsl:choose>
                    </td>
                    <td class="hide-mobile">
                      <span class="priority-pill"><xsl:value-of select="sitemap:priority"/></span>
                    </td>
                    <td class="hide-mobile" style="color: #64748b; font-size: 13px; font-family: monospace;">
                      <xsl:value-of select="substring(sitemap:lastmod, 0, 11)"/>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <div class="footer-note">
            ToolsVerse XML Sitemap is actively indexed by Googlebot. Robots and crawlers parse raw XML; human visitors enjoy this formatted dashboard view.
          </div>
        </div>

        <script type="text/javascript">
          function filterUrls() {
            var input = document.getElementById("urlSearch");
            var filter = input.value.toLowerCase();
            var table = document.getElementById("sitemapTable");
            var tr = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
            var visible = 0;

            for (var i = 0; i &lt; tr.length; i++) {
              var td = tr[i].getElementsByTagName("td")[1];
              if (td) {
                var txtValue = td.textContent || td.innerText;
                if (txtValue.toLowerCase().indexOf(filter) &gt; -1) {
                  tr[i].style.display = "";
                  visible++;
                } else {
                  tr[i].style.display = "none";
                }
              }
            }
            document.getElementById("visibleCount").innerText = visible;
          }
        </script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
